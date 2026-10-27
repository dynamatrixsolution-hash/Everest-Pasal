# Everest Pasal — Backend Database Backup & Recovery Demonstration

This guide provides a practical, step-by-step demonstration script that the backend engineer can present to the team and stakeholders to prove backup reliability and disaster recovery capabilities.

---

## Demonstration Workflow Summary

| Step | Action | Command | Expected Output |
|---|---|---|---|
| **1** | Inspect Primary Database | `psql -U postgres -d everest_pasal -c "\dt"` | Lists 23 core Everest Pasal tables |
| **2** | Review Prisma Schema | `npx prisma validate` | `The schema is valid` |
| **3** | Seed / Record Transactions | `npm run db:seed` | Populates orders, payments, accounts, shipments |
| **4** | Execute Live Backup | `npm run db:backup` | Timestamped `.dump` and `.manifest.json` |
| **5** | Inspect Backup Artifacts | `dir backups\database` | Displays archive and SHA-256 manifest |
| **6** | Verify Backup Integrity | `npm run db:backup:verify` | Parses 227 TOC items & 54 tables with `pg_restore --list` |
| **7** | Target Test Database | `RESTORE_TEST_DATABASE_URL` | Dedicated `everest_pasal_restore_test` database |
| **8** | Perform Safe Restoration | `npx tsx backend/scripts/restore-db.ts --target-env RESTORE_TEST_DATABASE_URL --confirm` | Confirmed restoration in ~1.4s |
| **9** | Validate Restored Schema | `npx prisma validate` | Confirms schema compliance |
| **10** | Query Restored Transactions | See Step 10 script | Queries accounts, orders, order items, and eSewa payments |
| **11** | Verify Relational Integrity | Integrity check output | Verifies foreign keys, amounts, snapshots |
| **12** | Inspect Health Status & Logs | `npm run db:backup:status` | Shows `HEALTHY`, size, age, verification status |

---

## Detailed Step-by-Step Demonstration Walkthrough

### Step 1: Show PostgreSQL Database & Active Tables
Demonstrate that the primary database is active and contains the full suite of Everest Pasal schema tables:
```bash
psql -U postgres -h localhost -d everest_pasal -c "\dt"
```

### Step 2: Show Prisma Schema & Model Integrity
Demonstrate that the Prisma schema (`prisma/schema.prisma`) maps all 23 conceptual business entities (ENT-001 through ENT-023):
```bash
npx prisma validate
npx prisma migrate status
```

### Step 3: Populate Business Transactions
Show real transactional records being inserted (Account, Vendor Organization, Offers, Baskets, Orders, eSewa Payment Attempts, Shipments, Audit Events):
```bash
npm run db:seed
```

### Step 4: Execute Live Database Backup
Run the native PostgreSQL backup engine:
```bash
npm run db:backup
```
**Demonstration Highlight**:
* Point out that credentials are not exposed on the command line.
* Point out that the custom archive format (`-Fc`) with maximum compression is used.
* Show the structured audit log output.

### Step 5: Show Generated Backup File & Cryptographic Manifest
Inspect the `backups/database/` directory:
```bash
dir backups\database
```
Open the generated `.manifest.json` file to show:
* `backupId`
* `database` name (`everest_pasal`)
* `sizeBytes`
* `sha256` cryptographic hash
* `schemaVersion`
* `prismaVersion`

### Step 6: Run Backup Verification
Execute the verification utility:
```bash
npm run db:backup:verify
```
**Demonstration Highlight**:
* `pg_restore --list` reads the binary Table of Contents (TOC) without touching the database.
* The SHA-256 hash of the archive is checked against the manifest to guarantee zero file tampering.

### Step 7 & 8: Restore the Backup into a Separate Test Database
Execute the restore command targeting the isolated test database:
```bash
npx tsx backend/scripts/restore-db.ts --target-env RESTORE_TEST_DATABASE_URL --confirm
```
**Demonstration Highlight**:
* Show what happens when run **without** `--confirm` (safe dry run safeguard).
* Show what happens if someone accidentally targets primary production (blocked by production safety guard).
* Show successful restore in ~1.4 seconds.

### Step 9 & 10: Query Restored Business Records
Demonstrate that the recovered database is fully functional and queryable:

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.RESTORE_TEST_DATABASE_URL } }
});
async function verify() {
  const accounts = await prisma.account.count();
  const orders = await prisma.order.findFirst({
    include: {
      account: true,
      orderItems: true,
      paymentAttempts: true,
      fulfillmentUnits: { include: { shipments: true } },
    },
  });
  console.log('Restored Accounts count :', accounts);
  console.log('Restored Order Number   :', orders?.orderNumber);
  console.log('Customer Full Name      :', orders?.account.fullName);
  console.log('Total Commercial Amount :', orders?.totalAmount.toString(), orders?.currency);
  console.log('Order Item SKU          :', orders?.orderItems[0]?.sku);
  console.log('Payment Provider & State:', orders?.paymentAttempts[0]?.method, orders?.paymentAttempts[0]?.status);
  console.log('Shipment Carrier        :', orders?.fulfillmentUnits[0]?.shipments[0]?.carrierName);
}
verify().finally(() => prisma.$disconnect());
"
```

### Step 11: Single-Command Automated Audit Verification
Run the unified backup readiness suite:
```bash
npm run db:backup:test
```
Displays the 10-point audit checklist:
```text
========================================
  EVEREST PASAL DATABASE BACKUP TEST    
========================================

--- TEST EXECUTION REPORT ---
[PASS] PostgreSQL connection
[PASS] pg_dump available
[PASS] Backup created
[PASS] Backup file exists
[PASS] Backup file non-zero size (86.58 KB)
[PASS] Backup file readable
[PASS] Backup metadata valid
[PASS] Prisma schema valid
[PASS] Migration status checked
[PASS] Restore verification (test database)
[PASS] Relational integrity verified (Found 3 accounts, 1 orders with active relations intact.)

========================================
RESULT: BACKUP SYSTEM READY
========================================
```

### Step 12: Demonstrate Operational Status & Health Check
Show the CLI status report:
```bash
npm run db:backup:status
```
Or start the backend server and query the HTTP health endpoint:
```bash
npm start
# In a separate terminal / browser:
curl http://localhost:4000/health/backup
```
Response:
```json
{
  "serviceStatus": "HEALTHY",
  "backupEnabled": true,
  "totalBackupsCount": 2,
  "latestBackup": {
    "filename": "everest-pasal-db-2026-09-18-22-27-27.dump",
    "createdAt": "2026-09-18T16:42:27.168Z",
    "ageHours": 0.02,
    "sizeBytes": 88659,
    "sizeFormatted": "86.58 KB",
    "verified": true,
    "status": "VERIFIED"
  },
  "retentionDays": 7,
  "database": {
    "host": "localhost",
    "port": 5432,
    "databaseName": "everest_pasal"
  }
}
```
Demonstrate that zero credentials or sensitive system paths are leaked.
