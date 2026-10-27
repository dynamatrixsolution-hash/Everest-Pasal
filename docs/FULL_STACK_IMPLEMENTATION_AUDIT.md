# Everest Pasal — Full-Stack Implementation Audit & Blueprint

**Document Version**: 2.0  
**Target Environment**: Node.js + Express (TypeScript) / React 18 (Vite + TypeScript) / PostgreSQL 18  
**Authoritative Specification**: `Everest_Pasal_Database_Design_Documentation.docx`  
**Database State**: 21 PostgreSQL Schemas / 183 Authoritative Tables Live

---

## 1. Executive Summary & Architecture Overview

Everest Pasal is an enterprise-grade multi-tenant, multi-vendor e-commerce marketplace platform operating across **three distinct application surfaces**:
1. **Customer Web Storefront**: Public catalog browsing, search, dynamic carts, checkout, order tracking, returns, support.
2. **Vendor Seller Center**: Dedicated merchant portal for product listing management, pricing, inventory positions, sub-order fulfillment, and settlement reconciliation.
3. **Admin Control Center**: Platform governance, KYC approvals, global catalog management, cross-merchant logistics, finance/double-entry journal audits, and system configuration.

```
+-----------------------------------------------------------------------------------+
|                            THREE ISOLATED SURFACES                                |
|  Customer Web (/)   |   Vendor Panel (/vendor/*)   |   Admin Panel (/admin/*)     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        CENTRALIZED API CLIENT (/api/v1/*)                        |
|  - Auth Bearer Header    - Company-Code Header    - Idempotency & Error Handling  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                            EXPRESS BACKEND LAYER                                  |
|  1. Auth & Session Extraction (JWT/Session Hash)                                 |
|  2. CompanyCode & Role-Based Authorization Guard (Customer/Vendor/Admin)          |
|  3. Input Validation (Zod / Joi / Type Guards)                                    |
|  4. Business Services Layer (Pricing, Stock, Orders, Settlements)                 |
|  5. Repository / Data Access Layer (Multi-tenant company_code scoping)            |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                  POSTGRESQL 18 AUTHORITATIVE DATABASE                            |
|  - 21 Dedicated Schemas (ep_system, ep_geo, ep_identity, ep_commerce, ep_kyc...)   |
|  - 183 Physical Tables (UUID PKs, company_code tenant keys, lifecycle triggers)  |
|  - 585 Active Database Triggers (Soft-delete invariants, journal debit=credit...) |
+-----------------------------------------------------------------------------------+
```

---

## 2. Comprehensive System Audit

### 2.1 Database & Schema Verification (Live PostgreSQL 18)
- **Database Name**: `everest_pasal`
- **Active Schemas**: 21 (`ep_system`, `ep_geo`, `ep_identity`, `ep_customer`, `ep_merchant`, `ep_catalog`, `ep_inventory`, `ep_pricing`, `ep_commerce`, `ep_payment`, `ep_finance`, `ep_fulfillment`, `ep_logistics`, `ep_returns`, `ep_growth`, `ep_content`, `ep_comms`, `ep_integration`, `ep_support`, `ep_audit`, `ep_kyc`).
- **Active Tables**: Exactly **183 tables** created and verified.
- **Legacy Prototype Tables**: Dropped and cleaned from `public` schema.
- **Integrity Triggers**: 585 triggers installed, enforcing physical delete prevention, `active=false -> publish=false`, double-entry balance checks, and append-only ledgers.

### 2.2 Backend Architecture Audit (`backend/src/`)
- **Server Entry**: [backend/src/server.ts](file:///c:/Users/ACER/OneDrive/Desktop/Everest-Pasal/backend/src/server.ts) mounts `/auth` and `/api/*`.
- **Existing Modules**:
  - `auth`: Basic login/register endpoints.
  - `catalog`: Product and category controllers.
  - `cart`: Cart add/remove logic.
  - `orders`: Basic order creation.
  - `admin`: Vendor and customer listings.
  - `backup`: Comprehensive pg_dump/pg_restore and automated rotation suite with 13 passing unit tests.
- **Identified Backend Needs**:
  1. Standardize all API route endpoints under `/api/v1/` prefix.
  2. Implement dedicated repositories for the 21 `ep_*` schemas.
  3. Ensure all SQL queries/ORM calls target the new `ep_*` tables (`ep_identity.tb_ep_identity_user_user_master`, `ep_catalog.tb_ep_catalog_prd_product_master`, `ep_commerce.tb_ep_commerce_ord_order_master`, etc.).

### 2.3 Frontend Architecture Audit (`frontend/src/`)
- **Framework**: React 18 + Vite + TypeScript.
- **Routing Engine**: [frontend/src/router/index.tsx](file:///c:/Users/ACER/OneDrive/Desktop/Everest-Pasal/frontend/src/router/index.tsx) with browser history support.
- **Surface Isolation**: [frontend/src/App.tsx](file:///c:/Users/ACER/OneDrive/Desktop/Everest-Pasal/frontend/src/App.tsx) provides strict path-based surface separation:
  - `CustomerLayout`: Public Storefront (`/`), `/products`, `/categories`, `/cart`, `/checkout`, `/orders`.
  - `VendorLayout`: Protected Vendor Portal (`/vendor/*`).
  - `AdminLayout`: Protected Admin Portal (`/admin/*`).
- **Authentication Guards**: [frontend/src/components/Auth/AuthGuards.tsx](file:///c:/Users/ACER/OneDrive/Desktop/Everest-Pasal/frontend/src/components/Auth/AuthGuards.tsx) prevents cross-surface access without appropriate credentials.

---

## 3. Database-to-API-to-Frontend Traceability Matrix

| Business Domain | Target PostgreSQL Tables | Backend Route (`/api/v1`) | Frontend Surface & Page |
|---|---|---|---|
| **Identity & Auth** | `ep_identity.tb_ep_identity_user_user_master`<br>`ep_identity.tb_ep_identity_auth_credential_master`<br>`ep_identity.tb_ep_admin_log_session_master` | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/register`<br>`GET /api/v1/auth/me` | Public `/login`, `/register`<br>Vendor `/vendor/login`<br>Admin `/admin/login` |
| **Catalog & Products** | `ep_catalog.tb_ep_catalog_prd_product_master`<br>`ep_catalog.tb_ep_catalog_prd_product_variant_master`<br>`ep_catalog.tb_ep_catalog_cat_category_master` | `GET /api/v1/products`<br>`GET /api/v1/products/:id`<br>`GET /api/v1/categories` | Customer Storefront `/`, `/products`, `/categories` |
| **Cart & Pricing** | `ep_commerce.tb_ep_commerce_cart_cart_master`<br>`ep_commerce.tb_ep_commerce_cart_cart_item_detail`<br>`ep_pricing.tb_ep_pricing_price_product_price_detail` | `GET /api/v1/cart`<br>`POST /api/v1/cart/items`<br>`DELETE /api/v1/cart/items/:id` | Customer `/cart` |
| **Checkout & Orders** | `ep_commerce.tb_ep_commerce_checkout_checkout_session`<br>`ep_commerce.tb_ep_commerce_ord_order_master`<br>`ep_commerce.tb_ep_commerce_ord_merchant_order_master`<br>`ep_commerce.tb_ep_commerce_ord_order_item_detail` | `POST /api/v1/checkout/validate`<br>`POST /api/v1/checkout`<br>`GET /api/v1/orders` | Customer `/checkout`<br>Customer `/orders` |
| **Vendor Operations** | `ep_merchant.tb_ep_merchant_vendor_merchant_master`<br>`ep_merchant.tb_ep_merchant_store_store_master`<br>`ep_merchant.tb_ep_merchant_prd_listing_master`<br>`ep_inventory.tb_ep_inventory_stk_stock_item_master` | `GET /api/v1/vendor/dashboard`<br>`GET /api/v1/vendor/products`<br>`GET /api/v1/vendor/orders`<br>`GET /api/v1/vendor/inventory` | Vendor `/vendor/dashboard`<br>Vendor `/vendor/products`<br>Vendor `/vendor/inventory` |
| **Admin Control** | `ep_merchant.tb_ep_merchant_vendor_merchant_master`<br>`ep_kyc.tb_ep_kyc_case_verification_case_master`<br>`ep_finance.tb_ep_finance_settlement_merchant_settlement_master`<br>`ep_audit.tb_ep_audit_activity_activity_log` | `GET /api/v1/admin/dashboard`<br>`GET /api/v1/admin/vendors`<br>`POST /api/v1/admin/vendors/:id/approve`<br>`GET /api/v1/admin/audit` | Admin `/admin/dashboard`<br>Admin `/admin/vendors`<br>Admin `/admin/audit` |

---

## 4. Recommended Full-Stack Implementation Phases

### Phase 1: Data Access Layer & Repositories (`backend/src/repositories/`)
- Build type-safe repositories querying `ep_*` schemas directly using PostgreSQL connection pool and query helpers.
- Implement company context scoping (`company_code = 'EP_NEPAL'`).

### Phase 2: Core Business Services (`backend/src/services/`)
- `AuthService`: Password hashing (bcrypt/argon2), user creation in `ep_identity`, session tracking in `ep_identity.tb_ep_admin_log_session_master`.
- `CatalogService`: Product, category, and variant retrieval from `ep_catalog` with published filter (`active=true AND publish=true`).
- `CartService` & `CheckoutService`: Cart session management in `ep_commerce`, server-side pricing validation, multi-vendor order splitting into `tb_ep_commerce_ord_merchant_order_master`.
- `VendorService`: Scoped listing management, inventory positions, sub-order fulfillments.
- `AdminService`: Vendor KYC approvals, audit logs retrieval, system settings.

### Phase 3: REST API Controllers & Routes (`/api/v1/*`)
- Mount all unified `/api/v1/*` routes in `server.ts`.
- Attach authorization middleware to validate JWT roles (`CUSTOMER`, `VENDOR`, `ADMIN`).

### Phase 4: Frontend API Client Integration & End-to-End Verification
- Connect React frontend API clients ([frontend/src/api/client.ts](file:///c:/Users/ACER/OneDrive/Desktop/Everest-Pasal/frontend/src/api/client.ts)) to `/api/v1/*`.
- Verify complete live user flows across Customer Web, Vendor Panel, and Admin Panel.
