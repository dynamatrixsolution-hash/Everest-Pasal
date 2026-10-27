# Everest Pasal — Backend Testing Suite & Verification

## 1. Test Architecture

The automated test suite runs via Vitest against the live PostgreSQL database instance:

- Test Runner: `vitest run`
- Execution Time: ~2.8s
- Test Files: 4 suites
- Total Tests: 67 automated assertions

---

## 2. Test Suites Overview

1. **`enterprise-183-database.test.ts`** (6 tests):
   - Validates live connectivity across all 21 PostgreSQL schemas.
   - Asserts exact 183 physical base tables presence and schema mapping.
2. **`backup.test.ts`** (13 tests):
   - Tests automated dump creation, SHA-256 manifest verification, dry-run parsing, production safety flags (`--force-production --confirm`), and retention pruning.
3. **`full-stack-api.test.ts`** (16 tests):
   - Tests end-to-end authentication, RBAC authorization, customer profiles, catalog lookups, and order placements.
4. **`complete-backend-api.test.ts`** (32 tests):
   - Exhaustive coverage across all 21 business modules: System, Geo, Identity, KYC/KYB, Customer, Merchant, Catalog, Inventory, Pricing, Commerce, Payment, Finance, Fulfillment, Logistics, Returns, Growth, Content, Communications, Integration, Support, and Audit.
