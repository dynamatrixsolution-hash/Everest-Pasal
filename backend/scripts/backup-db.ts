// ==============================================================================
// EVEREST PASAL - BACKEND DATABASE BACKUP SCRIPT
// Executes native PostgreSQL pg_dump in custom archive format (-Fc)
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { parseDatabaseUrl, findPgBinary } from '../src/utils/db-config.js';
import { logStructured, recordAuditEvent } from '../src/utils/audit-logger.js';
import { writeManifest, computeFileSha256, BackupManifest } from '../src/utils/manifest.js';
import { cleanupOldBackups } from './cleanup-backups.js';

dotenv.config();

export interface BackupResult {
  success: boolean;
  filename?: string;
  filePath?: string;
  sizeBytes?: number;
  durationMs?: number;
  error?: string;
  manifest?: BackupManifest;
}

/**
 * Creates a timestamp string formatted as: YYYY-MM-DD-HH-mm-ss
 */
export function formatBackupTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}`;
}

/**
 * Executes a PostgreSQL pg_dump command safely.
 */
export async function runDatabaseBackup(options?: {
  connectionUrl?: string;
  backupDir?: string;
  skipRetention?: boolean;
}): Promise<BackupResult> {
  const startedAt = new Date();
  const rawUrl = options?.connectionUrl || process.env.DATABASE_URL;

  if (!rawUrl) {
    const errorMsg = 'DATABASE_URL is not configured in the environment.';
    logStructured({
      operation: 'DATABASE_BACKUP',
      status: 'FAILED',
      startedAt: startedAt.toISOString(),
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }

  let dbConfig;
  try {
    dbConfig = parseDatabaseUrl(rawUrl);
  } catch (err: any) {
    const errorMsg = `Failed to parse database connection: ${err.message}`;
    logStructured({
      operation: 'DATABASE_BACKUP',
      status: 'FAILED',
      startedAt: startedAt.toISOString(),
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }

  const backupDir = path.resolve(options?.backupDir || process.env.DB_BACKUP_DIR || './backups/database');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = formatBackupTimestamp(startedAt);
  const filename = `everest-pasal-db-${timestamp}.dump`;
  const filePath = path.join(backupDir, filename);

  const pgDumpBin = findPgBinary('pg_dump');

  // Build pg_dump arguments using PostgreSQL Custom Archive Format (-Fc)
  // -Fc implies pg_dump's internal zlib compression and enables granular pg_restore
  const args = [
    '--host', dbConfig.host,
    '--port', dbConfig.port.toString(),
    '--username', dbConfig.user,
    '--format=c', // Custom archive format
    '--compress=9', // Maximum compression
    '--blobs', // Include large objects if any
    '--no-owner', // Omit ownership commands for portable restoration
    '--no-privileges', // Omit privilege grants for portable restoration
    '--file', filePath,
    dbConfig.database,
  ];

  console.log(`[BACKUP] Starting backup for database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}...`);
  console.log(`[BACKUP] Output archive: ${filePath}`);

  // Set password safely in child process environment, never in command-line arguments
  const childEnv = {
    ...process.env,
    PGPASSWORD: dbConfig.password || '',
  };

  return new Promise<BackupResult>((resolve) => {
    const child = spawn(pgDumpBin, args, {
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderrData = '';
    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', async (err) => {
      const durationMs = Date.now() - startedAt.getTime();
      const errorMsg = `Failed to execute pg_dump: ${err.message}`;
      console.error(`[BACKUP-ERROR] ${errorMsg}`);

      logStructured({
        operation: 'DATABASE_BACKUP',
        status: 'FAILED',
        startedAt: startedAt.toISOString(),
        durationMs,
        error: errorMsg,
      });

      await recordAuditEvent('DATABASE_BACKUP_FAILED', 'DatabaseBackup', null, {
        database: dbConfig.database,
        error: errorMsg,
      });

      resolve({ success: false, error: errorMsg, durationMs });
    });

    child.on('close', async (code) => {
      const durationMs = Date.now() - startedAt.getTime();

      if (code !== 0) {
        const errorMsg = `pg_dump failed with exit code ${code}. Stderr: ${stderrData.trim()}`;
        console.error(`[BACKUP-ERROR] ${errorMsg}`);

        // Cleanup empty or partial file if created
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }

        logStructured({
          operation: 'DATABASE_BACKUP',
          status: 'FAILED',
          startedAt: startedAt.toISOString(),
          durationMs,
          error: errorMsg,
        });

        await recordAuditEvent('DATABASE_BACKUP_FAILED', 'DatabaseBackup', null, {
          database: dbConfig.database,
          error: errorMsg,
          exitCode: code,
        });

        resolve({ success: false, error: errorMsg, durationMs });
        return;
      }

      // Verification Step 1: Check file exists
      if (!fs.existsSync(filePath)) {
        const errorMsg = 'Backup file was not found after pg_dump completed.';
        console.error(`[BACKUP-ERROR] ${errorMsg}`);
        resolve({ success: false, error: errorMsg, durationMs });
        return;
      }

      // Verification Step 2: Check non-zero size
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        const errorMsg = 'Generated backup file has 0 bytes (empty archive).';
        console.error(`[BACKUP-ERROR] ${errorMsg}`);
        try { fs.unlinkSync(filePath); } catch {}
        resolve({ success: false, error: errorMsg, durationMs });
        return;
      }

      // Compute SHA-256 and write manifest
      let sha256 = '';
      try {
        sha256 = await computeFileSha256(filePath);
      } catch (err: any) {
        console.warn(`[BACKUP-WARN] Failed to compute SHA-256: ${err.message}`);
      }

      const manifest: BackupManifest = {
        backupId: `bk_${timestamp}`,
        createdAt: startedAt.toISOString(),
        database: dbConfig.database,
        format: 'postgresql-custom',
        filename,
        sizeBytes: stats.size,
        sha256,
        status: 'CREATED',
        schemaVersion: '20260918_initial_baseline',
        prismaVersion: '6.19.3',
        applicationVersion: '1.0.0',
      };

      writeManifest(filePath, manifest);

      console.log(`[BACKUP-SUCCESS] Backup created successfully: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

      logStructured({
        operation: 'DATABASE_BACKUP',
        status: 'SUCCESS',
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        file: filename,
        sizeBytes: stats.size,
        verified: false,
        metadata: {
          sha256,
          format: 'postgresql-custom',
        },
      });

      await recordAuditEvent('DATABASE_BACKUP_COMPLETED', 'DatabaseBackup', filename, {
        database: dbConfig.database,
        sizeBytes: stats.size,
        sha256,
        filename,
        durationMs,
      });

      // Automatic retention cleanup if not disabled
      if (!options?.skipRetention) {
        try {
          cleanupOldBackups({ backupDir });
        } catch (cleanupErr: any) {
          console.warn(`[RETENTION-WARN] Cleanup warning: ${cleanupErr.message}`);
        }
      }

      resolve({
        success: true,
        filename,
        filePath,
        sizeBytes: stats.size,
        durationMs,
        manifest,
      });
    });
  });
}

// Direct execution from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('backup-db.ts')) {
  runDatabaseBackup()
    .then((res) => {
      if (!res.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL]', err);
      process.exit(1);
    });
}
