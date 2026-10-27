// ==============================================================================
// EVEREST PASAL - DATABASE RESTORE SCRIPT
// High-risk recovery utility executing native PostgreSQL pg_restore
// Requires explicit confirmation and guards against accidental production overwrites
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { parseDatabaseUrl, findPgBinary } from '../src/utils/db-config.js';
import { logStructured, recordAuditEvent } from '../src/utils/audit-logger.js';
import { verifyManifest } from '../src/utils/manifest.js';
import { getLatestBackupFile } from './verify-backup.js';

dotenv.config();

export interface RestoreOptions {
  filePath?: string;
  targetConnectionUrl?: string;
  targetEnvVar?: string;
  confirm?: boolean;
  forceProduction?: boolean;
}

export interface RestoreResult {
  success: boolean;
  targetDatabase?: string;
  filePath?: string;
  durationMs?: number;
  error?: string;
}

export async function runDatabaseRestore(options: RestoreOptions): Promise<RestoreResult> {
  const startedAt = new Date();

  // 1. Resolve Target File
  let filePath = options.filePath;
  if (!filePath) {
    const latest = getLatestBackupFile();
    if (!latest) {
      const errorMsg = 'No backup archive provided and none found in default directory.';
      console.error(`[RESTORE-ERROR] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
    filePath = latest;
  }

  const resolvedPath = path.resolve(filePath);

  // 2. Validate Archive Existence and Non-Zero Size
  if (!fs.existsSync(resolvedPath)) {
    const errorMsg = `Backup file does not exist: ${resolvedPath}`;
    console.error(`[RESTORE-ERROR] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const stats = fs.statSync(resolvedPath);
  if (stats.size === 0) {
    const errorMsg = `Backup file has 0 bytes (invalid archive): ${resolvedPath}`;
    console.error(`[RESTORE-ERROR] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  // 3. Resolve Target Database Connection
  let targetUrl: string | undefined;
  if (options.targetConnectionUrl) {
    targetUrl = options.targetConnectionUrl;
  } else if (options.targetEnvVar && process.env[options.targetEnvVar]) {
    targetUrl = process.env[options.targetEnvVar];
  } else if (process.env.RESTORE_TEST_DATABASE_URL) {
    // Default safe behavior: target the restore test database if available
    targetUrl = process.env.RESTORE_TEST_DATABASE_URL;
  } else {
    targetUrl = process.env.DATABASE_URL;
  }

  if (!targetUrl) {
    const errorMsg = 'No target database connection URL available.';
    console.error(`[RESTORE-ERROR] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const dbConfig = parseDatabaseUrl(targetUrl);
  const primaryDbConfig = process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : null;
  const isTargetingPrimary = primaryDbConfig && primaryDbConfig.database === dbConfig.database && primaryDbConfig.host === dbConfig.host;

  // 4. DISPLAY SAFETY WARNING & DRY RUN ASSESSMENT
  console.log('\n========================================================');
  console.log('       EVEREST PASAL — DATABASE RESTORE OPERATION        ');
  console.log('========================================================');
  console.log(`Source Archive   : ${path.basename(resolvedPath)} (${(stats.size / 1024).toFixed(2)} KB)`);
  console.log(`Target Host      : ${dbConfig.host}:${dbConfig.port}`);
  console.log(`Target Database  : ${dbConfig.database}`);
  console.log(`Target Sanitized : ${dbConfig.sanitizedUrl}`);
  console.log(`Primary Database : ${primaryDbConfig ? primaryDbConfig.database : 'N/A'}`);
  console.log('--------------------------------------------------------');

  // Verify manifest checksum
  const manifestCheck = await verifyManifest(resolvedPath);
  if (manifestCheck.valid) {
    console.log('[INTEGRITY] Manifest verified: SHA-256 checksum matched.');
  } else {
    console.log(`[INTEGRITY-WARN] Manifest check warning: ${manifestCheck.reason}`);
  }

  // 5. PRODUCTION SAFETY GUARD
  if (isTargetingPrimary && !options.forceProduction) {
    console.error('\n[CRITICAL SAFETY GUARD]');
    console.error('Target database is the PRIMARY/PRODUCTION database: ' + dbConfig.database);
    console.error('Restoring into the primary database will OVERWRITE live transactional records!');
    console.error('To proceed against primary, you must explicitly supply: --force-production --confirm\n');
    return {
      success: false,
      error: 'Restoration into primary database aborted. Missing --force-production safeguard.',
    };
  }

  // 6. CONFIRMATION CHECK
  if (!options.confirm) {
    console.warn('\n[DRY RUN SAFEGUARD]');
    console.warn('The --confirm flag was NOT provided.');
    console.warn('NO changes were made to the database.');
    console.warn('To execute the restore, re-run with: --confirm');
    console.warn('Example: npm run db:restore -- --file <archive> --confirm\n');
    return {
      success: false,
      error: 'Restoration cancelled: --confirm flag not provided.',
    };
  }

  console.log('\n[RESTORE] Confirmation accepted. Executing pg_restore...');

  const pgRestoreBin = findPgBinary('pg_restore');

  // Build pg_restore arguments
  // --clean: drop database objects before recreating them
  // --if-exists: avoid errors if objects do not exist yet
  // --no-owner: do not output commands to set ownership of objects
  // --no-privileges: prevent privilege errors
  const args = [
    '--host', dbConfig.host,
    '--port', dbConfig.port.toString(),
    '--username', dbConfig.user,
    '--dbname', dbConfig.database,
    '--clean',
    '--if-exists',
    '--no-owner',
    '--no-privileges',
    resolvedPath,
  ];

  const childEnv = {
    ...process.env,
    PGPASSWORD: dbConfig.password || '',
  };

  return new Promise<RestoreResult>((resolve) => {
    const child = spawn(pgRestoreBin, args, {
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderrData = '';
    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', async (err) => {
      const durationMs = Date.now() - startedAt.getTime();
      const errorMsg = `Failed to execute pg_restore: ${err.message}`;
      console.error(`[RESTORE-ERROR] ${errorMsg}`);

      logStructured({
        operation: 'DATABASE_RESTORE',
        status: 'FAILED',
        startedAt: startedAt.toISOString(),
        durationMs,
        file: path.basename(resolvedPath),
        error: errorMsg,
      });

      await recordAuditEvent('DATABASE_RESTORE_FAILED', 'DatabaseRestore', path.basename(resolvedPath), {
        targetDatabase: dbConfig.database,
        error: errorMsg,
      });

      resolve({ success: false, error: errorMsg, durationMs });
    });

    child.on('close', async (code) => {
      const durationMs = Date.now() - startedAt.getTime();

      // Note: pg_restore returns code 1 if there are minor non-fatal warnings (e.g. notices about dropping non-existent tables)
      // Any code > 1 is a hard failure.
      if (code !== 0 && code !== 1) {
        const errorMsg = `pg_restore exited with error code ${code}. Stderr: ${stderrData.trim()}`;
        console.error(`[RESTORE-ERROR] ${errorMsg}`);

        logStructured({
          operation: 'DATABASE_RESTORE',
          status: 'FAILED',
          startedAt: startedAt.toISOString(),
          durationMs,
          file: path.basename(resolvedPath),
          error: errorMsg,
        });

        await recordAuditEvent('DATABASE_RESTORE_FAILED', 'DatabaseRestore', path.basename(resolvedPath), {
          targetDatabase: dbConfig.database,
          error: errorMsg,
          exitCode: code,
        });

        resolve({ success: false, error: errorMsg, durationMs });
        return;
      }

      console.log(`[RESTORE-SUCCESS] Database restored into '${dbConfig.database}' in ${(durationMs / 1000).toFixed(2)}s.`);

      logStructured({
        operation: 'DATABASE_RESTORE',
        status: 'SUCCESS',
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        durationMs,
        file: path.basename(resolvedPath),
        metadata: {
          targetDatabase: dbConfig.database,
          host: dbConfig.host,
        },
      });

      await recordAuditEvent('DATABASE_RESTORE_COMPLETED', 'DatabaseRestore', path.basename(resolvedPath), {
        targetDatabase: dbConfig.database,
        durationMs,
      });

      resolve({
        success: true,
        targetDatabase: dbConfig.database,
        filePath: resolvedPath,
        durationMs,
      });
    });
  });
}

// Direct CLI entry point
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('restore-db.ts')) {
  const args = process.argv.slice(2);
  let filePath: string | undefined;
  let targetEnvVar: string | undefined;
  let targetConnectionUrl: string | undefined;
  let confirm = false;
  let forceProduction = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--file' || arg === '-f') && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    } else if (arg === '--target-env' && args[i + 1]) {
      targetEnvVar = args[i + 1];
      i++;
    } else if (arg === '--target-url' && args[i + 1]) {
      targetConnectionUrl = args[i + 1];
      i++;
    } else if (arg === '--confirm' || arg === 'confirm') {
      confirm = true;
    } else if (arg === '--force-production' || arg === 'force-production') {
      forceProduction = true;
    } else if (arg.endsWith('.dump')) {
      filePath = arg;
    } else if (arg.startsWith('postgresql://') || arg.startsWith('postgres://')) {
      targetConnectionUrl = arg;
    } else if (arg === 'RESTORE_TEST_DATABASE_URL' || arg === 'DATABASE_URL') {
      targetEnvVar = arg;
    }
  }

  runDatabaseRestore({
    filePath,
    targetEnvVar,
    targetConnectionUrl,
    confirm,
    forceProduction,
  })
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
