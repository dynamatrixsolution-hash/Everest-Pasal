// ==============================================================================
// EVEREST PASAL - COMPREHENSIVE BACKUP READINESS & TEST SUITE
// End-to-end audit verification for PostgreSQL, pg_dump, Prisma, and test restore
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { parseDatabaseUrl, findPgBinary } from '../src/utils/db-config.js';
import { runDatabaseBackup } from './backup-db.js';
import { verifyBackupFile } from './verify-backup.js';
import { runDatabaseRestore } from './restore-db.js';
import { verifyManifest } from '../src/utils/manifest.js';

dotenv.config();

interface TestCheck {
  title: string;
  passed: boolean;
  details?: string;
}

async function runBackupSystemTest() {
  console.log('\n========================================');
  console.log('  EVEREST PASAL DATABASE BACKUP TEST    ');
  console.log('========================================\n');

  const checks: TestCheck[] = [];
  const prisma = new PrismaClient();

  // 1. Check PostgreSQL connection
  try {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) throw new Error('DATABASE_URL is not set.');
    parseDatabaseUrl(rawUrl);
    await prisma.$queryRaw`SELECT 1 as test_connection;`;
    checks.push({ title: 'PostgreSQL connection', passed: true });
  } catch (err: any) {
    checks.push({ title: 'PostgreSQL connection', passed: false, details: err.message });
  }

  // 2. Check pg_dump available
  try {
    const pgDumpBin = findPgBinary('pg_dump');
    execSync(`"${pgDumpBin}" --version`, { stdio: 'pipe' });
    checks.push({ title: 'pg_dump available', passed: true });
  } catch (err: any) {
    checks.push({ title: 'pg_dump available', passed: false, details: err.message });
  }

  // 3. Create a backup
  let backupFile: string | undefined;
  try {
    const backupRes = await runDatabaseBackup({ skipRetention: true });
    if (!backupRes.success || !backupRes.filePath) {
      throw new Error(backupRes.error || 'Backup failed to create.');
    }
    backupFile = backupRes.filePath;
    checks.push({ title: 'Backup created', passed: true });
  } catch (err: any) {
    checks.push({ title: 'Backup created', passed: false, details: err.message });
  }

  // 4. Verify backup file exists
  if (backupFile && fs.existsSync(backupFile)) {
    checks.push({ title: 'Backup file exists', passed: true });
  } else {
    checks.push({ title: 'Backup file exists', passed: false, details: 'Backup file missing on disk.' });
  }

  // 5. Check file size (> 0)
  if (backupFile && fs.existsSync(backupFile) && fs.statSync(backupFile).size > 0) {
    const sizeKb = (fs.statSync(backupFile).size / 1024).toFixed(2);
    checks.push({ title: 'Backup file non-zero size', passed: true, details: `${sizeKb} KB` });
  } else {
    checks.push({ title: 'Backup file non-zero size', passed: false, details: 'File is 0 bytes.' });
  }

  // 6. Verify backup is readable via pg_restore --list
  if (backupFile) {
    try {
      const verifyRes = await verifyBackupFile(backupFile);
      if (verifyRes.valid) {
        checks.push({ title: 'Backup file readable', passed: true });
      } else {
        checks.push({ title: 'Backup file readable', passed: false, details: verifyRes.error });
      }
    } catch (err: any) {
      checks.push({ title: 'Backup file readable', passed: false, details: err.message });
    }
  } else {
    checks.push({ title: 'Backup file readable', passed: false, details: 'No file to verify.' });
  }

  // 7. Check backup metadata & manifest valid
  if (backupFile) {
    try {
      const manifestRes = await verifyManifest(backupFile);
      if (manifestRes.valid) {
        checks.push({ title: 'Backup metadata valid', passed: true });
      } else {
        checks.push({ title: 'Backup metadata valid', passed: false, details: manifestRes.reason });
      }
    } catch (err: any) {
      checks.push({ title: 'Backup metadata valid', passed: false, details: err.message });
    }
  } else {
    checks.push({ title: 'Backup metadata valid', passed: false, details: 'No manifest.' });
  }

  // 8. Validate Prisma schema
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
    checks.push({ title: 'Prisma schema valid', passed: true });
  } catch (err: any) {
    checks.push({ title: 'Prisma schema valid', passed: false, details: err.message });
  }

  // 9. Check migration status
  try {
    execSync('npx prisma migrate status', { stdio: 'pipe' });
    checks.push({ title: 'Migration status checked', passed: true });
  } catch (err: any) {
    checks.push({ title: 'Migration status checked', passed: false, details: err.message });
  }

  // 10. Restore verification to dedicated test database
  let restoreTestPassed = false;
  if (backupFile && process.env.RESTORE_TEST_DATABASE_URL) {
    try {
      const restoreRes = await runDatabaseRestore({
        filePath: backupFile,
        targetConnectionUrl: process.env.RESTORE_TEST_DATABASE_URL,
        confirm: true,
      });

      if (restoreRes.success) {
        restoreTestPassed = true;
        checks.push({ title: 'Restore verification (test database)', passed: true });
      } else {
        checks.push({ title: 'Restore verification (test database)', passed: false, details: restoreRes.error });
      }
    } catch (err: any) {
      checks.push({ title: 'Restore verification (test database)', passed: false, details: err.message });
    }
  } else {
    checks.push({ title: 'Restore verification (test database)', passed: false, details: 'RESTORE_TEST_DATABASE_URL not configured' });
  }

  // 11. Relational Integrity Query Check on Restored Test Database
  if (restoreTestPassed && process.env.RESTORE_TEST_DATABASE_URL) {
    const testPrisma = new PrismaClient({
      datasources: {
        db: { url: process.env.RESTORE_TEST_DATABASE_URL },
      },
    });
    try {
      const accountsCount = await testPrisma.account.count();
      const ordersCount = await testPrisma.order.count();
      const order = await testPrisma.order.findFirst({
        include: {
          account: true,
          orderItems: true,
          paymentAttempts: true,
        },
      });

      if (accountsCount > 0 && ordersCount > 0 && order && order.account && order.orderItems.length > 0) {
        checks.push({
          title: 'Relational integrity verified',
          passed: true,
          details: `Found ${accountsCount} accounts, ${ordersCount} orders with active relations intact.`,
        });
      } else {
        checks.push({ title: 'Relational integrity verified', passed: false, details: 'Incomplete restored records.' });
      }
    } catch (err: any) {
      checks.push({ title: 'Relational integrity verified', passed: false, details: err.message });
    } finally {
      await testPrisma.$disconnect().catch(() => {});
    }
  } else {
    checks.push({ title: 'Relational integrity verified', passed: false, details: 'Skipped due to failed restore.' });
  }

  await prisma.$disconnect().catch(() => {});

  // Print Summary Report
  console.log('--- TEST EXECUTION REPORT ---');
  let allPassed = true;
  for (const c of checks) {
    const tag = c.passed ? '[PASS]' : '[FAIL]';
    if (!c.passed) allPassed = false;
    const detailStr = c.details ? ` (${c.details})` : '';
    console.log(`${tag} ${c.title}${detailStr}`);
  }

  console.log('\n========================================');
  if (allPassed) {
    console.log('RESULT: BACKUP SYSTEM READY');
    console.log('========================================\n');
    process.exit(0);
  } else {
    console.error('RESULT: BACKUP SYSTEM HAS FAILURES');
    console.error('========================================\n');
    process.exit(1);
  }
}

runBackupSystemTest().catch((err) => {
  console.error('[FATAL] Backup system test crashed:', err);
  process.exit(1);
});
