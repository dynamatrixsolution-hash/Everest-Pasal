"use strict";
// ==============================================================================
// EVEREST PASAL - BACKUP HEALTH & STATUS UTILITY
// Safe status reporter exposing health metrics without leaking credentials or secrets
// ==============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackupHealthStatus = getBackupHealthStatus;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_js_1 = require("../src/utils/db-config.js");
const manifest_js_1 = require("../src/utils/manifest.js");
dotenv_1.default.config();
/**
 * Inspects the backup repository and produces a non-sensitive health status payload.
 */
function getBackupHealthStatus() {
    const backupDir = path_1.default.resolve(process.env.DB_BACKUP_DIR || './backups/database');
    const retentionDays = parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7', 10);
    const backupEnabled = process.env.DB_BACKUP_ENABLED !== 'false';
    let dbHost = 'unknown';
    let dbPort = 5432;
    let dbName = 'unknown';
    if (process.env.DATABASE_URL) {
        try {
            const cfg = (0, db_config_js_1.parseDatabaseUrl)(process.env.DATABASE_URL);
            dbHost = cfg.host;
            dbPort = cfg.port;
            dbName = cfg.database;
        }
        catch { }
    }
    if (!fs_1.default.existsSync(backupDir)) {
        return {
            serviceStatus: 'DEGRADED',
            backupEnabled,
            totalBackupsCount: 0,
            retentionDays,
            database: { host: dbHost, port: dbPort, databaseName: dbName },
        };
    }
    const files = fs_1.default.readdirSync(backupDir).filter((f) => f.endsWith('.dump'));
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
        const fullPath = path_1.default.join(backupDir, f);
        const stats = fs_1.default.statSync(fullPath);
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
    const manifest = (0, manifest_js_1.readManifest)(newest.fullPath);
    const isVerified = manifest?.status === 'VERIFIED';
    // Consider degraded if latest backup is older than 26 hours (daily backup missed)
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
// CLI output
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('backup-status.ts')) {
    const status = getBackupHealthStatus();
    console.log('\n========================================================');
    console.log('       EVEREST PASAL — DATABASE BACKUP HEALTH REPORT     ');
    console.log('========================================================');
    console.log(`Overall Health     : [${status.serviceStatus}]`);
    console.log(`Backup Enabled     : ${status.backupEnabled}`);
    console.log(`Target Database    : ${status.database.databaseName} on ${status.database.host}:${status.database.port}`);
    console.log(`Total Backups      : ${status.totalBackupsCount}`);
    console.log(`Config Retention   : ${status.retentionDays} days`);
    if (status.latestBackup) {
        console.log('--------------------------------------------------------');
        console.log(`Latest File        : ${status.latestBackup.filename}`);
        console.log(`Created At         : ${status.latestBackup.createdAt}`);
        console.log(`Archive Age        : ${status.latestBackup.ageHours} hours ago`);
        console.log(`Archive Size       : ${status.latestBackup.sizeFormatted} (${status.latestBackup.sizeBytes} bytes)`);
        console.log(`Verification State : ${status.latestBackup.verified ? 'VERIFIED (PASS)' : 'CREATED (UNVERIFIED)'}`);
    }
    else {
        console.log('--------------------------------------------------------');
        console.log('Warning: No database backups found on disk.');
    }
    console.log('========================================================\n');
}
