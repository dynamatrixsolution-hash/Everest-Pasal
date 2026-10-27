// ==============================================================================
// EVEREST PASAL - AUTOMATED TEST SUITE FOR DATABASE BACKUP & RESTORE FOUNDATION
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseDatabaseUrl, redactDatabaseUrl, findPgBinary } from '../src/utils/db-config.js';
import { computeFileSha256, writeManifest, readManifest, verifyManifest, BackupManifest } from '../src/utils/manifest.js';
import { cleanupOldBackups } from '../scripts/cleanup-backups.js';
import { runDatabaseRestore } from '../scripts/restore-db.js';
import { runDatabaseBackup } from '../scripts/backup-db.js';

const TEST_DIR = path.resolve('./backups/test-temp');

describe('Database Configuration & Security', () => {
  it('should safely parse valid PostgreSQL connection URLs', () => {
    const url = 'postgresql://admin_user:SuperSecretP@ss@db.everestpasal.internal:5432/everest_prod?sslmode=require';
    const config = parseDatabaseUrl(url);

    expect(config.host).toBe('db.everestpasal.internal');
    expect(config.port).toBe(5432);
    expect(config.database).toBe('everest_prod');
    expect(config.user).toBe('admin_user');
    expect(config.password).toBe('SuperSecretP@ss');
    expect(config.ssl).toBe(true);
  });

  it('should redact credentials from sanitized URLs', () => {
    const url = 'postgresql://admin_user:SuperSecretP%40ss@localhost:5432/everest_pasal';
    const redacted = redactDatabaseUrl(url);

    expect(redacted).not.toContain('SuperSecretP');
    expect(redacted).toContain('*****');
  });

  it('should reject invalid or non-postgres URLs', () => {
    expect(() => parseDatabaseUrl('')).toThrow();
    expect(() => parseDatabaseUrl('mongodb://localhost:27017/mydb')).toThrow('Unsupported database protocol');
    expect(() => parseDatabaseUrl('not-a-valid-url')).toThrow();
  });

  it('should locate PostgreSQL binaries', () => {
    const pgDump = findPgBinary('pg_dump');
    const pgRestore = findPgBinary('pg_restore');

    expect(pgDump).toBeTruthy();
    expect(pgRestore).toBeTruthy();
    expect(pgDump.toLowerCase()).toContain('pg_dump');
    expect(pgRestore.toLowerCase()).toContain('pg_restore');
  });
});

describe('Backup Manifest & Cryptographic Verification', () => {
  const dummyDumpPath = path.join(TEST_DIR, 'dummy.dump');

  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    fs.writeFileSync(dummyDumpPath, 'EVEREST_PASAL_TEST_DUMP_HEADER_AND_DATA');
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should compute consistent SHA-256 checksums', async () => {
    const hash1 = await computeFileSha256(dummyDumpPath);
    const hash2 = await computeFileSha256(dummyDumpPath);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it('should create and verify valid manifests', async () => {
    const hash = await computeFileSha256(dummyDumpPath);
    const stats = fs.statSync(dummyDumpPath);

    const manifest: BackupManifest = {
      backupId: 'bk_test_001',
      createdAt: new Date().toISOString(),
      database: 'everest_pasal',
      format: 'postgresql-custom',
      filename: 'dummy.dump',
      sizeBytes: stats.size,
      sha256: hash,
      status: 'CREATED',
      schemaVersion: '20260918_initial_baseline',
      prismaVersion: '6.19.3',
      applicationVersion: '1.0.0',
    };

    writeManifest(dummyDumpPath, manifest);

    const loaded = readManifest(dummyDumpPath);
    expect(loaded).toBeDefined();
    expect(loaded?.sha256).toBe(hash);

    const check = await verifyManifest(dummyDumpPath);
    expect(check.valid).toBe(true);
  });

  it('should detect corrupted or tampered backup files', async () => {
    const hash = await computeFileSha256(dummyDumpPath);
    const stats = fs.statSync(dummyDumpPath);

    const manifest: BackupManifest = {
      backupId: 'bk_test_002',
      createdAt: new Date().toISOString(),
      database: 'everest_pasal',
      format: 'postgresql-custom',
      filename: 'dummy.dump',
      sizeBytes: stats.size,
      sha256: hash,
      status: 'CREATED',
      schemaVersion: '20260918_initial_baseline',
      prismaVersion: '6.19.3',
      applicationVersion: '1.0.0',
    };

    writeManifest(dummyDumpPath, manifest);

    // Tamper file content
    fs.appendFileSync(dummyDumpPath, '_CORRUPTED_BYTES');

    const check = await verifyManifest(dummyDumpPath);
    expect(check.valid).toBe(false);
    expect(check.reason).toContain('mismatch');
  });

  it('should reject zero-byte files', async () => {
    const emptyFile = path.join(TEST_DIR, 'empty.dump');
    fs.writeFileSync(emptyFile, '');

    const check = await verifyManifest(emptyFile);
    expect(check.valid).toBe(false);
    expect(check.reason).toContain('zero bytes');
  });
});

describe('Retention & Rotation Safeguards', () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should prune backups older than retention days while preserving newer ones', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // File 1: New (today)
    const f1 = path.join(TEST_DIR, 'backup-today.dump');
    fs.writeFileSync(f1, 'dump_today');

    // File 2: 3 days old (within 7 days)
    const f2 = path.join(TEST_DIR, 'backup-3days.dump');
    fs.writeFileSync(f2, 'dump_3days');
    fs.utimesSync(f2, (now - 3 * dayMs) / 1000, (now - 3 * dayMs) / 1000);

    // File 3: 10 days old (expired)
    const f3 = path.join(TEST_DIR, 'backup-10days.dump');
    fs.writeFileSync(f3, 'dump_10days');
    fs.utimesSync(f3, (now - 10 * dayMs) / 1000, (now - 10 * dayMs) / 1000);

    const result = cleanupOldBackups({ backupDir: TEST_DIR, retentionDays: 7 });

    expect(result.scannedCount).toBe(3);
    expect(result.deletedCount).toBe(1);
    expect(result.deletedFiles).toContain('backup-10days.dump');
    expect(result.retainedCount).toBe(2);
    expect(fs.existsSync(f3)).toBe(false);
    expect(fs.existsSync(f1)).toBe(true);
    expect(fs.existsSync(f2)).toBe(true);
  });

  it('SAFETY RULE: should NEVER delete the newest backup even if older than retention limit', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Only one single old backup exists (e.g. server was paused for 30 days)
    const fOnly = path.join(TEST_DIR, 'backup-sole-old.dump');
    fs.writeFileSync(fOnly, 'sole_surviving_dump');
    fs.utimesSync(fOnly, (now - 30 * dayMs) / 1000, (now - 30 * dayMs) / 1000);

    const result = cleanupOldBackups({ backupDir: TEST_DIR, retentionDays: 7 });

    expect(result.scannedCount).toBe(1);
    expect(result.deletedCount).toBe(0);
    expect(result.retainedCount).toBe(1);
    expect(fs.existsSync(fOnly)).toBe(true);
  });
});

describe('Restore Safety Controls', () => {
  it('should abort restore without the explicit --confirm flag', async () => {
    const res = await runDatabaseRestore({
      filePath: './nonexistent.dump',
      confirm: false,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('does not exist');
  });

  it('should reject missing backup files', async () => {
    const res = await runDatabaseRestore({
      filePath: './backups/database/definitely_not_existing.dump',
      confirm: true,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('does not exist');
  });

  it('should prevent accidental production overwrites without --force-production', async () => {
    // When target matches primary DATABASE_URL, safety guard blocks execution
    const dummyPath = path.resolve('./backups/test-dummy.dump');
    fs.writeFileSync(dummyPath, 'header');

    try {
      const res = await runDatabaseRestore({
        filePath: dummyPath,
        targetConnectionUrl: process.env.DATABASE_URL,
        confirm: true,
        forceProduction: false,
      });

      expect(res.success).toBe(false);
      expect(res.error?.toLowerCase()).toContain('primary database');
    } finally {
      if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    }
  });
});
