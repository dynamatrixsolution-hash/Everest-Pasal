// ==============================================================================
// EVEREST PASAL - BACKUP RETENTION & ROTATION SCRIPT
// Prunes expired database archives while strictly safeguarding the newest backup
// ==============================================================================

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { logStructured, recordAuditEvent } from '../src/utils/audit-logger.js';
import { getManifestPath } from '../src/utils/manifest.js';

dotenv.config();

export interface CleanupResult {
  scannedCount: number;
  deletedCount: number;
  deletedFiles: string[];
  retainedCount: number;
  retainedFiles: string[];
}

export function cleanupOldBackups(options?: {
  backupDir?: string;
  retentionDays?: number;
}): CleanupResult {
  const startedAt = new Date();
  const dir = path.resolve(options?.backupDir || process.env.DB_BACKUP_DIR || './backups/database');
  const retentionDays = options?.retentionDays ?? (parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7', 10) || 7);

  if (!fs.existsSync(dir)) {
    return { scannedCount: 0, deletedCount: 0, deletedFiles: [], retainedCount: 0, retainedFiles: [] };
  }

  // Look for .dump files in backup directory
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.dump'));

  if (files.length === 0) {
    return { scannedCount: 0, deletedCount: 0, deletedFiles: [], retainedCount: 0, retainedFiles: [] };
  }

  // Get file info with creation/modification times
  const fileInfos = files.map((f) => {
    const fullPath = path.join(dir, f);
    const stats = fs.statSync(fullPath);
    return {
      name: f,
      fullPath,
      mtimeMs: stats.mtimeMs,
      sizeBytes: stats.size,
    };
  });

  // Sort descending by mtime (newest first)
  fileInfos.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const now = Date.now();
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  const deletedFiles: string[] = [];
  const retainedFiles: string[] = [];

  // SAFETY RULE: NEVER delete the newest backup (index 0 is ALWAYS retained)
  fileInfos.forEach((fileInfo, index) => {
    const ageMs = now - fileInfo.mtimeMs;
    const isExpired = ageMs > maxAgeMs;

    if (index === 0) {
      // Always retain the most recent backup regardless of age
      retainedFiles.push(fileInfo.name);
    } else if (isExpired) {
      try {
        fs.unlinkSync(fileInfo.fullPath);
        // Also remove accompanying manifest if present
        const manifestPath = getManifestPath(fileInfo.fullPath);
        if (fs.existsSync(manifestPath)) {
          fs.unlinkSync(manifestPath);
        }
        deletedFiles.push(fileInfo.name);
        console.log(`[CLEANUP] Pruned expired backup: ${fileInfo.name} (age: ${(ageMs / (24 * 3600 * 1000)).toFixed(1)} days)`);
      } catch (err: any) {
        console.warn(`[CLEANUP-WARN] Failed to delete ${fileInfo.name}: ${err.message}`);
        retainedFiles.push(fileInfo.name);
      }
    } else {
      retainedFiles.push(fileInfo.name);
    }
  });

  if (deletedFiles.length > 0) {
    logStructured({
      operation: 'DATABASE_BACKUP_ROTATION',
      status: 'CLEANUP',
      startedAt: startedAt.toISOString(),
      metadata: {
        retentionDays,
        scannedCount: fileInfos.length,
        deletedCount: deletedFiles.length,
        deletedFiles,
        retainedCount: retainedFiles.length,
      },
    });

    recordAuditEvent('DATABASE_BACKUP_CLEANUP', 'BackupDirectory', dir, {
      retentionDays,
      deletedFiles,
      retainedCount: retainedFiles.length,
    }).catch(() => {});
  }

  return {
    scannedCount: fileInfos.length,
    deletedCount: deletedFiles.length,
    deletedFiles,
    retainedCount: retainedFiles.length,
    retainedFiles,
  };
}

// Direct execution from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cleanup-backups.ts')) {
  console.log('[CLEANUP] Inspecting backup directory for retention rotation...');
  const result = cleanupOldBackups();
  console.log(`[CLEANUP] Done. Scanned: ${result.scannedCount}, Pruned: ${result.deletedCount}, Retained: ${result.retainedCount}`);
}
