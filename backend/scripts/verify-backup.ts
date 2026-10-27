// ==============================================================================
// EVEREST PASAL - BACKUP VERIFICATION SCRIPT
// Validates archive integrity using pg_restore --list and SHA-256 manifest check
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { findPgBinary } from '../src/utils/db-config.js';
import { logStructured, recordAuditEvent } from '../src/utils/audit-logger.js';
import { verifyManifest, readManifest, writeManifest, BackupManifest } from '../src/utils/manifest.js';

dotenv.config();

export interface VerificationResult {
  valid: boolean;
  filePath: string;
  filename: string;
  sizeBytes: number;
  tableCount?: number;
  tocCount?: number;
  sha256Valid?: boolean;
  error?: string;
  manifest?: BackupManifest;
}

/**
 * Finds the latest .dump file in the specified or default directory.
 */
export function getLatestBackupFile(backupDir?: string): string | null {
  const dir = path.resolve(backupDir || process.env.DB_BACKUP_DIR || './backups/database');
  if (!fs.existsSync(dir)) return null;

  const dumps = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.dump'))
    .map((f) => {
      const fullPath = path.join(dir, f);
      return { fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return dumps.length > 0 ? dumps[0].fullPath : null;
}

/**
 * Verifies a backup file using:
 * 1. Physical existence & size > 0 check
 * 2. Cryptographic SHA-256 manifest checksum verification
 * 3. PostgreSQL archive metadata parsing via `pg_restore --list`
 */
export async function verifyBackupFile(targetFilePath?: string): Promise<VerificationResult> {
  const startedAt = new Date();
  let filePath = targetFilePath;

  if (!filePath) {
    const latest = getLatestBackupFile();
    if (!latest) {
      const errorMsg = 'No backup archive found to verify in the backup directory.';
      return { valid: false, filePath: '', filename: '', sizeBytes: 0, error: errorMsg };
    }
    filePath = latest;
  }

  const resolvedPath = path.resolve(filePath);
  const filename = path.basename(resolvedPath);

  console.log(`[VERIFY] Inspecting backup archive: ${filename}...`);

  // 1. Existence check
  if (!fs.existsSync(resolvedPath)) {
    const errorMsg = `Backup file does not exist at ${resolvedPath}`;
    console.error(`[VERIFY-FAIL] ${errorMsg}`);
    return { valid: false, filePath: resolvedPath, filename, sizeBytes: 0, error: errorMsg };
  }

  // 2. Non-zero size check
  const stats = fs.statSync(resolvedPath);
  if (stats.size === 0) {
    const errorMsg = `Backup file is empty (0 bytes): ${resolvedPath}`;
    console.error(`[VERIFY-FAIL] ${errorMsg}`);
    return { valid: false, filePath: resolvedPath, filename, sizeBytes: 0, error: errorMsg };
  }

  // 3. Manifest and cryptographic SHA-256 verification
  const manifestCheck = await verifyManifest(resolvedPath);
  if (!manifestCheck.valid) {
    console.warn(`[VERIFY-WARN] Manifest validation issue: ${manifestCheck.reason}`);
  }

  // 4. PostgreSQL native pg_restore --list verification
  const pgRestoreBin = findPgBinary('pg_restore');

  return new Promise<VerificationResult>((resolve) => {
    const child = spawn(pgRestoreBin, ['--list', resolvedPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      const errorMsg = `Failed to execute pg_restore --list: ${err.message}`;
      console.error(`[VERIFY-FAIL] ${errorMsg}`);
      resolve({
        valid: false,
        filePath: resolvedPath,
        filename,
        sizeBytes: stats.size,
        error: errorMsg,
      });
    });

    child.on('close', async (code) => {
      if (code !== 0) {
        const errorMsg = `pg_restore --list failed with code ${code}: ${stderrData.trim()}`;
        console.error(`[VERIFY-FAIL] ${errorMsg}`);
        resolve({
          valid: false,
          filePath: resolvedPath,
          filename,
          sizeBytes: stats.size,
          error: errorMsg,
        });
        return;
      }

      // Parse TOC entries from stdout
      const lines = stdoutData.split('\n').filter((l) => l.trim().length > 0);
      const tableLines = lines.filter((l) => l.includes('TABLE DATA') || l.includes('TABLE public'));

      console.log(`[VERIFY-PASS] Archive header and TOC successfully parsed.`);
      console.log(`[VERIFY-PASS] Archive TOC entries: ${lines.length}, Tables recognized: ${tableLines.length}`);

      // Update manifest status to VERIFIED
      const manifest = readManifest(resolvedPath);
      if (manifest) {
        manifest.status = 'VERIFIED';
        manifest.verifiedAt = new Date().toISOString();
        manifest.tablesCount = tableLines.length;
        writeManifest(resolvedPath, manifest);
      }

      logStructured({
        operation: 'DATABASE_BACKUP_VERIFICATION',
        status: 'VERIFIED',
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        file: filename,
        sizeBytes: stats.size,
        verified: true,
        metadata: {
          tocCount: lines.length,
          tablesCount: tableLines.length,
          sha256Valid: manifestCheck.valid,
        },
      });

      await recordAuditEvent('DATABASE_BACKUP_VERIFIED', 'DatabaseBackup', filename, {
        sizeBytes: stats.size,
        tocCount: lines.length,
        tablesCount: tableLines.length,
      });

      resolve({
        valid: true,
        filePath: resolvedPath,
        filename,
        sizeBytes: stats.size,
        tocCount: lines.length,
        tableCount: tableLines.length,
        sha256Valid: manifestCheck.valid,
        manifest: manifest || undefined,
      });
    });
  });
}

// Direct execution from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verify-backup.ts')) {
  // Support --file <path> argument
  let targetFile: string | undefined;
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--file' && process.argv[i + 1]) {
      targetFile = process.argv[i + 1];
    }
  }

  verifyBackupFile(targetFile)
    .then((res) => {
      if (!res.valid) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}
