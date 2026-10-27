// ==============================================================================
// EVEREST PASAL - BACKUP HEALTH SERVICE
// Exposes operational backup status for administration and health monitoring
// ==============================================================================

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { parseDatabaseUrl } from '../../utils/db-config.js';
import { readManifest } from '../../utils/manifest.js';

dotenv.config();

export interface BackupHealthStatus {
  serviceStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  backupEnabled: boolean;
  totalBackupsCount: number;
  latestBackup?: {
    filename: string;
    createdAt: string;
    ageHours: number;
    sizeBytes: number;
    sizeFormatted: string;
    verified: boolean;
    status: string;
  };
  retentionDays: number;
  database: {
    host: string;
    port: number;
    databaseName: string;
  };
}

export function getBackupHealthStatus(): BackupHealthStatus {
  const backupDir = path.resolve(process.env.DB_BACKUP_DIR || './backups/database');
  const retentionDays = parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7', 10);
  const backupEnabled = process.env.DB_BACKUP_ENABLED !== 'false';

  let dbHost = 'unknown';
  let dbPort = 5432;
  let dbName = 'unknown';

  if (process.env.DATABASE_URL) {
    try {
      const cfg = parseDatabaseUrl(process.env.DATABASE_URL);
      dbHost = cfg.host;
      dbPort = cfg.port;
      dbName = cfg.database;
    } catch {}
  }

  if (!fs.existsSync(backupDir)) {
    return {
      serviceStatus: 'DEGRADED',
      backupEnabled,
      totalBackupsCount: 0,
      retentionDays,
      database: { host: dbHost, port: dbPort, databaseName: dbName },
    };
  }

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.dump'));

  if (files.length === 0) {
    return {
      serviceStatus: 'DEGRADED',
      backupEnabled,
      totalBackupsCount: 0,
      retentionDays,
      database: { host: dbHost, port: dbPort, databaseName: dbName },
    };
  }

  const fileInfos = files.map((f) => {
    const fullPath = path.join(backupDir, f);
    const stats = fs.statSync(fullPath);
    return {
      filename: f,
      fullPath,
      mtimeMs: stats.mtimeMs,
      sizeBytes: stats.size,
    };
  });

  fileInfos.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const newest = fileInfos[0];
  const ageHours = parseFloat(((Date.now() - newest.mtimeMs) / (1000 * 3600)).toFixed(2));
  const manifest = readManifest(newest.fullPath);

  const isVerified = manifest?.status === 'VERIFIED';
  const serviceStatus = ageHours > 26 ? 'DEGRADED' : isVerified ? 'HEALTHY' : 'HEALTHY';

  return {
    serviceStatus,
    backupEnabled,
    totalBackupsCount: files.length,
    latestBackup: {
      filename: newest.filename,
      createdAt: manifest?.createdAt || new Date(newest.mtimeMs).toISOString(),
      ageHours,
      sizeBytes: newest.sizeBytes,
      sizeFormatted: `${(newest.sizeBytes / 1024).toFixed(2)} KB`,
      verified: isVerified,
      status: manifest?.status || 'CREATED',
    },
    retentionDays,
    database: {
      host: dbHost,
      port: dbPort,
      databaseName: dbName,
    },
  };
}
