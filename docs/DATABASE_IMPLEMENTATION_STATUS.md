# Everest Pasal - Database Implementation Status Report

## Executive Summary

| Metric | Specification Target | Status |
|---|---|---|
| **Authoritative Document** | `Everest_Pasal_Database_Design_Documentation.docx` | Fully Adopted |
| **Target Database Engine** | PostgreSQL 15+ / 16+ | Validated |
| **Total Schemas** | **21 Schemas** | Defined & Mapped |
| **Total Tables** | **183 Tables** | 100% Cataloged & Specified |
| **Primary Key Pattern** | `id uuid` (immutable PK) | 183 / 183 Tables |
| **Multi-Tenancy Key** | `company_code varchar(20)` | 183 / 183 Tables |
| **Standard Lifecycle Columns** | `active`, `publish`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deactivated_at`, `deactivated_by`, `deactivation_reason` | Standardized Across All 183 Tables |
| **Fiscal Year Temporal Scoping** | `fiscal_year_code varchar(20)` | Enforced on all Fiscal-Year Required tables |
| **Application Surfaces** | 3 Distinct Surfaces (Customer Web, Vendor Panel, Admin Panel) | Architected & Mapped |

---

## 1. Schema Breakdown & Table Count

The 183 tables are partitioned across 21 dedicated PostgreSQL schemas:

| # | PostgreSQL Schema | Table Count | Functional Domain |
|---|---|---|---|
| 1 | `ep_system` | 11 | Multi-company configuration, branch master, FTP, comms setup, DB link/route & feature flags |
| 2 | `ep_geo` | 8 | Country, Province, District, City, Postal Code, Service Areas, Delivery Zones & Mappings |
| 3 | `ep_identity` | 11 | Users, Credentials, Roles, Permissions, User-Roles, Role-Permissions, Sessions, OTP, Devices, API Keys |
| 4 | `ep_customer` | 6 | Customer Profile, Addresses, Preferences, Saved Payment Tokens, Favorite Stores, Recent Product Views |
| 5 | `ep_merchant` | 11 | Merchant Organization, Members, Stores, Addresses, KYC Documents, Bank Accounts, Contracts, Settings, Commission Maps, Listings & Listing Variants |
| 6 | `ep_catalog` | 12 | Categories, Brands, Products, Product Variants, Attributes, Values, Attribute Maps, Media, Docs, Category Taxonomy, Reviews |
| 7 | `ep_inventory` | 12 | Warehouses, Warehouse Zones, Stock Items, Stock Movements, Reservations, Adjustments, Transfers, Transfer Details, Stock Counts, Count Details, Batches, Reorder Rules |
| 8 | `ep_pricing` | 10 | Price Lists, Product Prices, Discounts, Promotions, Promotion Conditions, Promotion Rewards, Coupons, Coupon Redemptions, Tax Rules, Shipping Rate Rules |
| 9 | `ep_commerce` | 14 | Carts, Cart Items, Wishlists, Wishlist Items, Checkout Sessions, Orders, Merchant Orders, Order Items, Order Address Snapshots, Order Charges, Order Discounts, Order Status History, Order Notes, Order Cancellations |
| 10 | `ep_payment` | 7 | Payment Providers, Payment Intents, Payment Transactions, Refunds, Refund Transactions, COD Receivables, Webhook Events |
| 11 | `ep_finance` | 9 | Chart of Accounts, Journal Headers, Journal Line Details, Merchant Settlements, Settlement Items, Merchant Payouts, Payout Transactions, Commission Rules, Commission Entries |
| 12 | `ep_fulfillment` | 7 | Stock Allocations, Fulfillment Headers, Fulfillment Items, Pick Lists, Pick List Items, Packages, Package Items |
| 13 | `ep_logistics` | 17 | Carriers, Carrier Services, Shipment Rate Quotes, Shipments, Shipment Package Map, Shipment Labels, Tracking Events, Pickup Requests, Hubs, Routes, Bags, Bag Items, Manifests, Manifest Items, Riders, Rider Assignments, Proof of Delivery (POD) |
| 14 | `ep_returns` | 6 | Return Reasons, Return Requests (RMA), Return Items, Return Inspections, Reverse Shipment Map, Restock Actions |
| 15 | `ep_growth` | 7 | Agents, Influencers, Marketing Campaigns, Referral Codes, Tracking Links, Attribution Transactions, Growth Commission Events |
| 16 | `ep_content` | 5 | CMS Pages, Marketing Banners, Navigation Menus, Menu Items, FAQs |
| 17 | `ep_comms` | 5 | Message Templates, Notifications, Notification Recipients, Delivery Attempts, User Channel Preferences |
| 18 | `ep_integration` | 7 | Provider Connection Master, Outbox Event Queue, Inbox Event Log, Webhook Subscriptions, Webhook Delivery Queue, Bulk Import Jobs, Bulk Export Jobs |
| 19 | `ep_support` | 4 | Support Tickets, Ticket Messages, Ticket Attachments, Ticket Status History |
| 20 | `ep_audit` | 4 | Activity Log, Entity Change Log (CDC), Security Event Log, Data Access Log |
| 21 | `ep_kyc` | 10 | KYC Subject Master, Requirement Setup, Verification Cases, Document Master, Verification Checks, Provider Master, Provider Response Logs, Risk Flags, Decision History, Consent Transactions |
| **Total** | **21 Schemas** | **183 Tables** | **Complete Platform Ecosystem** |

---

## 2. Global Column Standard Verification

Every single table in the specification adheres strictly to the unified corporate schema baseline:

```sql
-- Standard Physical Column Template
id                   uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
company_code         varchar(20)              NOT NULL,
-- [Optional domain-specific columns ...]
-- [Optional fiscal_year_code varchar(20) NOT NULL for fiscal-year scoped tables]
active               boolean                  NOT NULL DEFAULT true,
publish              boolean                  NOT NULL DEFAULT false,
created_at           timestamptz              NOT NULL DEFAULT clock_timestamp(),
created_by           uuid                     NULL,
updated_at           timestamptz              NULL,
updated_by           uuid                     NULL,
deactivated_at       timestamptz              NULL,
deactivated_by       uuid                     NULL,
deactivation_reason  varchar(500)             NULL
```

### Invariants Enforced:
1. **Soft Delete vs Visibility**: `active = false` designates operational deactivation. When `active = false`, `publish` MUST be forced to `false`. Records are never physically deleted in transactional, financial, audit, or inventory ledgers.
2. **Company-Scoped Multi-Tenancy**: `company_code` is present in every table and participates in compound unique indexes, ensuring multi-organization isolation without physical data fragmentation.
3. **Immutability of Financial & Inventory Ledgers**: Movements in `tb_ep_inventory_stk_stock_movement_txn`, `tb_ep_finance_journal_journal_master`, `tb_ep_finance_journal_journal_line_detail`, `tb_ep_payment_txn_payment_transaction_txn`, and `tb_ep_growth_attr_attribution_txn` are append-only.
4. **Secrets & PII Masking**: No plain-text secrets, raw cards, or unmasked bank numbers are stored. Only references (`credential_reference`, `secret_reference`, `payment_token_reference`, `account_no_masked`) or encrypted blobs (`document_no_encrypted`) are permitted.

---

## 3. Implementation Checklist & Phase Roadmap

- [x] **Phase 1: DOCX Specification Traceability & Mapping**
  - Cross-referenced all 183 tables against the authoritative documentation.
  - Verified exact PostgreSQL physical snake_case table and column identifiers.
- [x] **Phase 2: Master Architecture Documentation Generation**
  - Generated `docs/DATABASE_TABLE_CATALOG.md` (complete 183-table directory).
  - Generated `docs/DATABASE_RELATIONSHIP_MAP.md` (cross-schema foreign keys and dependency trees).
  - Generated `docs/DATABASE_CONSTRAINTS.md` (primary keys, foreign keys, unique rules, and check constraints).
  - Generated `docs/DATABASE_INDEXES.md` (btree, compound, partial, and jsonb GIN indexes).
  - Generated `docs/DATABASE_SECURITY_MODEL.md` (RBAC, PII redaction, encryption, and audit tracking).
  - Generated `docs/DATABASE_TENANCY_MODEL.md` (company-level tenancy, merchant isolation, and surface access).
  - Generated `docs/DATABASE_TRACEABILITY_MATRIX.md` (DOCX specification to PostgreSQL mapping).
- [ ] **Phase 3: ORM & Migration Alignment**
  - Migrate Prisma schema to support multi-schema (`@@schema`, `@@map`).
  - Generate raw SQL DDL migration files for all 21 schemas and 183 tables.
- [ ] **Phase 4: Multi-Surface Role & API Layer Integration**
  - Customer Web API, Vendor Merchant API, Platform Admin API isolation verification.
- [ ] **Phase 5: Automated Verification & Cross-Tenant Security Testing**
  - Execute tenant leak tests and role permission boundary checks.
