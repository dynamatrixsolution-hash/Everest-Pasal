# Everest Pasal — Database Backup, Recovery & Disaster Recovery Specification

This document defines the operational architecture, procedures, safeguards, and recovery workflows for the Everest Pasal PostgreSQL database, compliant with the Everest Pasal System Architecture (v1.2), DEC-014, and system engineering controls (ENG-005, ENG-006, ENG-012, ENG-015).

---

## A. Architecture

The Everest Pasal database backup system implements a layered, verifiable architecture following the core operational principle:

> **"A backup is not considered successful until the backup file exists, has a non-zero size, and its archive contents and integrity can be cryptographically and logically verified."**

```text
Everest Pasal Core Backend / API
             │
             ▼
PostgreSQL Primary Database (`everest_pasal`)
             │
             ▼
Logical Backup Engine (Native `pg_dump` with Custom Archive `-Fc`)
             │
             ▼
Cryptographic Manifest Generation (`.manifest.json` with SHA-256 Checksum)
             │
             ▼
Local Backup Storage (`backups/database/`) [Gitignored & Restricted]
             │
    ┌────────┴──────────────────────────┐
    ▼                                   ▼
Automated Retention Rotation       Backup Verification Pipeline
(Prunes expired, protects newest)  (`pg_restore --list` header audit)
                                        │
                                        ▼
                               Restoration Verification Test
                               (Dedicated `everest_pasal_restore_test`)
                                        │
                                        ▼
                               Prisma Schema & Relational Integrity Validation
```

### Recommended Production Tier Architecture
In production environments, application-level logical dumps complement infrastructure-level resilience:

```text
PostgreSQL Managed Snapshots (AWS RDS / Neon / Cloud SQL PITR)
               +
Application-Level PostgreSQL Custom Backups (`pg_dump -Fc` via automated scheduler)
               +
Encrypted Off-Site Cold Storage (Amazon S3 Glacier / Google Cloud Storage with Object Lock)
```

---

## B. Prerequisites

The backup and recovery system relies on standard native database tools and modern backend runtimes:

1. **PostgreSQL Client Tools**:
   * `pg_dump` (version 15+; version 18 installed locally)
   * `pg_restore` (version 15+; version 18 installed locally)
   * `psql`
2. **Node.js Runtime**:
   * Node.js v20+ (tested on Node.js v23.5.0)
   * npm / npx
3. **Prisma ORM**:
   * Prisma Client (`@prisma/client`)
   * Prisma CLI (`prisma`)
4. **Environment Configuration**:
   * Configured `.env` file with proper access credentials.

---

## C. Environment Variables Reference

All backup operations read configuration dynamically from environment variables. Credentials are never hardcoded in scripts.

| Variable Name | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string for the primary database. Redacted in all operational logs. |
| `RESTORE_TEST_DATABASE_URL` | Optional | — | Dedicated target database connection used for non-destructive restore tests. |
| `DB_BACKUP_DIR` | No | `./backups/database` | Relative or absolute filesystem path where backup archives and manifests are stored. |
| `DB_BACKUP_RETENTION_DAYS` | No | `7` | Maximum age in days before an archive is rotated/pruned. |
| `DB_BACKUP_ENABLED` | No | `true` | Feature flag allowing operators to temporarily suppress automated scheduled backup runs. |
| `PG_BIN_PATH` | No | Auto-detected | Directory path containing PostgreSQL client executables (e.g., `C:\Program Files\PostgreSQL\18\bin` or `/usr/bin`). |
| `PORT` | No | `4000` | Port for the backend application and `/health/backup` observability endpoint. |

---

## D. Manual Backup

To trigger an on-demand database backup, run:

```bash
npm run db:backup
```

### What Happens Internally:
1. Validates and parses `DATABASE_URL` safely without printing passwords to terminal or process lists.
2. Creates `./backups/database` if missing.
3. Generates a timestamped archive: `everest-pasal-db-YYYY-MM-DD-HH-mm-ss.dump`.
4. Executes native `pg_dump` with `-Fc` (PostgreSQL custom format with zlib compression).
5. Confirms child process exit code is 0.
6. Confirms output file exists and has size > 0 bytes.
7. Computes a SHA-256 checksum and produces an adjacent `.manifest.json` metadata record.
8. Writes an immutable audit entry to `AuditEvent` (`ENT-022`) with action `DATABASE_BACKUP_COMPLETED`.
9. Invokes retention cleanup to prune expired archives while guaranteeing the preservation of the newest archive.

---

## E. Backup Verification

To verify that an archive is healthy and uncorrupted without writing to any database:

```bash
# Verify the latest backup in the default directory:
npm run db:backup:verify

# Or verify a specific file:
npm run db:backup:verify -- --file backups/database/everest-pasal-db-2026-09-18-22-19-48.dump
```

### Verification Checks Performed:
1. **Physical File Check**: File exists and byte size > 0.
2. **Cryptographic Check**: Actual SHA-256 matches the checksum recorded in `.manifest.json`.
3. **Archive Metadata & Header Parsing**: Executes `pg_restore --list` to parse the archive's internal Table of Contents (TOC), verifying that table schemas, indexes, sequences, and data blocks are readable.
4. **Manifest Update**: Sets status to `VERIFIED` and logs an `AuditEvent` (`DATABASE_BACKUP_VERIFIED`).

---

## F. Safe Restore Procedure

> [!CAUTION]
> **Restore is a HIGH-RISK operational command.**
> Restoring a database drops and recreates existing database objects. The restore script includes active safeguards to prevent accidental data loss.

### 1. Dry Run (Default Behavior)
If you execute the restore command without the `--confirm` flag, the script will show target database details and immediately exit without modifying the database:

```bash
npm run db:restore -- --file backups/database/example.dump
```

Output:
```text
[DRY RUN SAFEGUARD]
The --confirm flag was NOT provided.
NO changes were made to the database.
To execute the restore, re-run with: --confirm
```

### 2. Confirmed Execution
To execute the restoration, explicitly provide `--confirm`:

```bash
npm run db:restore -- --file backups/database/example.dump --confirm
```

### 3. Production Protection Guard
If the restore target matches the primary `DATABASE_URL`, the script automatically blocks execution unless an additional explicit flag is supplied:

```bash
# Blocked automatically:
npm run db:restore -- --file backups/database/example.dump --confirm
# Output: [CRITICAL SAFETY GUARD] Target database is the PRIMARY/PRODUCTION database!

# Requires explicit dual confirmation:
npm run db:restore -- --file backups/database/example.dump --force-production --confirm
```

---

## G. Restore to a Separate Test Database

To verify recovery capability without endangering production data, always restore into a dedicated verification database (such as `everest_pasal_restore_test`).

```bash
# 1. Ensure test database exists
psql -U postgres -h localhost -c "CREATE DATABASE everest_pasal_restore_test;"

# 2. Run confirmed restore into test database
npm run db:restore -- --file backups/database/everest-pasal-db-2026-09-18-22-19-48.dump --target-env RESTORE_TEST_DATABASE_URL --confirm

# 3. Validate Prisma schema & data on restored database
DATABASE_URL="postgresql://postgres:password@localhost:5432/everest_pasal_restore_test?schema=public" npx prisma validate
```

---

## H. Production Disaster Recovery Sequence

When recovering a failed or corrupted production database, execute this strict 12-step protocol:

1. **Declare Incident & Identify Failure**: Confirm database unavailability, hardware fault, or data corruption incident.
2. **Stop Affected Traffic**: Put application into read-only maintenance mode or divert traffic to prevent new writes during restoration.
3. **Select Latest Verified Backup**: Run `npm run db:backup:status` to identify the most recent backup with `VERIFIED (PASS)` state.
4. **Provision / Inspect Target Database**: Ensure clean PostgreSQL instance or provision fresh database target.
5. **Execute Controlled Restore**: Run `npm run db:restore -- --file <verified_archive> --confirm`.
6. **Validate Schema Consistency**: Run `npx prisma validate` and `npx prisma migrate status`.
7. **Validate Core Transactional Records**: Verify row counts across critical tables (`Account`, `Organization`, `Order`, `PaymentAttempt`, `Shipment`, `AuditEvent`).
8. **Verify Financial & Relational Integrity**: Check foreign key references, order totals, and pending payment attempts.
9. **Execute Backend Smoke Tests**: Run backend health checks and integration smoke tests against the recovered database.
10. **Confirm Application Health**: Inspect `/health` and `/health/backup` endpoints.
11. **Resume Traffic**: Switch DNS/routing from maintenance mode back to active production traffic.
12. **Record Post-Incident Evidence**: Archive the recovery log, duration, target references, and audit events.

---

## I. Disaster Recovery Limitations

No backup system can guarantee total immunity against all failure modes. Operators must understand the operational boundaries:

1. **Recovery Point Objective (RPO) Window**: Data written between the last successful backup run and the moment of catastrophic failure is not covered by the logical dump (Point-In-Time Recovery via WAL archiving or managed DB snapshots is required for sub-minute RPO).
2. **Pre-Existing Data Corruption**: If logical corruption or application bugs corrupted data *before* the backup executed, the backup will faithfully preserve that corrupted state.
3. **Credentials Compromise**: If database credentials or host access keys are leaked, backups stored on the same server are vulnerable to malicious deletion (requires isolated off-site cold storage).
4. **Storage Medium Failures**: Backups stored solely on the primary server disk are vulnerable to hardware or virtual disk destruction (requires multi-region object storage).
5. **Network / Provider-Wide Outages**: Cloud-wide data center outages require cross-region disaster recovery replication.

---

## J. Automated Scheduling

The Everest Pasal backup engine is provider-neutral and does not lock the application into continuous Node timers. Backups should be orchestrated using standard infrastructure schedulers.

### 1. Linux Cron (Recommended for standalone servers / VMs)
Schedule daily backup at 1:00 AM UTC and prune expired files:

```cron
0 1 * * * cd /var/www/everest-pasal && /usr/bin/npm run db:backup >> /var/log/everest-pasal-backup.log 2>&1
0 2 * * * cd /var/www/everest-pasal && /usr/bin/npm run db:backup:verify >> /var/log/everest-pasal-backup.log 2>&1
```

### 2. Docker / Containerized Environment
Add an auxiliary cron sidecar or run as a scheduled task:

```bash
docker compose exec backend npm run db:backup
```

### 3. Cloud Schedulers (AWS EventBridge / GCP Cloud Scheduler)
Trigger a container task or serverless task executing `npm run db:backup`.
