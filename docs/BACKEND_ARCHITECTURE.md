# Everest Pasal — Backend Architecture Specification

## 1. Architectural Principles & Layering

Everest Pasal implements a strict 7-tier enterprise layered architecture designed to interact directly with the authoritative 21 PostgreSQL schemas and 183 physical base tables.

```
       CLIENT SURFACES (Customer Web / Vendor Panel / Admin Panel)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          1. API ROUTING LAYER                          │
│                (/api/v1/* versioned Express Router)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. MIDDLEWARE PIPELINE                          │
│  - Request Context (UUID Request ID, Default CompanyCode)              │
│  - CORS & Security Headers                                             │
│  - Authentication (JWT Validation & Session Hash Verification)         │
│  - Authorization & Multi-Tenancy Scope (RBAC / CompanyCode Guard)      │
│  - Centralized Schema Validation (Zod / Type Guards)                   │
│  - Idempotency Interceptor (Durable Idempotency-Key Caching)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       3. CONTROLLER / ADAPTER                          │
│  - Request parameter parsing & context unmarshaling                    │
│  - Standardized JSON envelope output (sendSuccess / sendError)         │
│  - Zero business logic inside route handlers                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         4. BUSINESS SERVICE LAYER                      │
│  - Complex multi-step business transactions                            │
│  - Invariant enforcement (Double-entry balancing, stock audit)         │
│  - State machine transitions & outbox event dispatching                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    5. REPOSITORY / DATA ACCESS LAYER                   │
│  - Parameterized SQL execution & type safety                           │
│  - Strict CompanyCode tenancy scoping (`company_code = $1`)            │
│  - Explicit table mapping to physical 183 database tables              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                6. DATABASE CONNECTION POOL & ORM LAYER                 │
│  - Prisma Client & pg Pool (Native PostgreSQL connection pooling)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                7. AUTHORITATIVE POSTGRESQL 18 DATABASE                 │
│  - 21 Schemas (`ep_system`, `ep_geo`, `ep_identity`, ..., `ep_audit`) │
│  - 183 Physical Base Tables                                            │
│  - Database Routines, Triggers, Double-Entry Rules, Immutability Guards│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 21 Domain Modules

Every business domain is encapsulated in an isolated module structure adhering to the database schema design:

| Module Domain | PostgreSQL Schema | Primary Tables Covered | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **System** | `ep_system` | 11 tables | Company master, fiscal years, feature flags, system settings, document series |
| **Geography** | `ep_geo` | 8 tables | Countries, provinces, districts, municipalities, postal codes, delivery zones |
| **Identity** | `ep_identity` | 11 tables | Users, credentials, sessions, OTP challenge txns, roles, permissions, API keys |
| **KYC / KYB** | `ep_kyc` | 10 tables | Verification cases, document master, checks, decision history, risk flags |
| **Customer** | `ep_customer` | 6 tables | Customer profiles, address details, preferences, saved payments, view logs |
| **Merchant / Vendor** | `ep_merchant` | 13 tables | Merchant profiles, stores, bank accounts, contracts, listing variants |
| **Catalog** | `ep_catalog` | 14 tables | Categories, brands, products, variants, attributes, media gallery |
| **Inventory** | `ep_inventory` | 9 tables | Warehouses, stock item master, double-entry stock movements, reservations |
| **Pricing** | `ep_pricing` | 10 tables | Price lists, product prices, promotions, rewards, coupons, tax rules |
| **Commerce** | `ep_commerce` | 13 tables | Shopping carts, cart items, checkout sessions, purchase orders, order items |
| **Payment** | `ep_payment` | 7 tables | Payment providers, payment intents, payment txns, refunds, COD receivables |
| **Finance** | `ep_finance` | 13 tables | General ledger accounts, balanced double-entry journals, vendor settlements |
| **Fulfillment** | `ep_fulfillment` | 10 tables | Stock allocation, fulfillment orders, pick lists, packing packages |
| **Logistics** | `ep_logistics` | 10 tables | Carriers, shipments, tracking event history, dispatch bags, delivery manifests |
| **Returns** | `ep_returns` | 8 tables | Return requests, return items, return inspections, restock evaluations |
| **Growth** | `ep_growth` | 11 tables | Referral codes, influencer campaigns, affiliate links, commission accruals |
| **Content** | `ep_content` | 8 tables | CMS pages, promotional banners, navigation menus, FAQs |
| **Communications** | `ep_comms` | 8 tables | User notifications, templates, communication logs, SMS/Email delivery attempts |
| **Integration** | `ep_integration` | 8 tables | Transactional outbox queue, inbound webhook logs, import/export jobs |
| **Support** | `ep_support` | 4 tables | Customer support tickets, message conversations, attachments, status history |
| **Audit** | `ep_audit` | 4 tables | Immutable operational activity log, security audit log, data access log |

---

## 3. Tenancy & CompanyCode Scoping Boundary

Multi-tenancy isolation is enforced at the database and repository layer:

1. **Header / Token Extraction**: The client request passes standard authentication headers. The `context.middleware.ts` determines the active `CompanyCode` (`EP_NEPAL`).
2. **Untrusted Client Inputs**: Client-provided `companyCode` headers or payload bodies are ignored or validated against the authenticated user's authorized company scope.
3. **Repository Guarantee**: Every SQL statement in every repository explicitly incorporates `company_code = $1` as a non-negotiable predicate:
   ```sql
   SELECT * FROM ep_commerce.tb_ep_commerce_ord_order_master 
   WHERE company_code = $1 AND id = $2::uuid AND active = true;
   ```
4. **Cross-Tenant Prevention**: Direct ID alterations in URLs (e.g. accessing `/api/v1/orders/ORD-123`) will return `404 Not Found` or `403 Forbidden` if the resource belongs to another tenant or another customer.

---

## 4. Standard Response Envelope

All API endpoints strictly output a uniform JSON response structure:

### Success Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource created / retrieved successfully",
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": []
  }
}
```

---

## 5. Transaction Safety & Invariant Guarantees

- **Double-Entry Finance Balancing**: Journal entries require sum of Debits == sum of Credits before committing to `ep_finance`.
- **Traceable Stock Movements**: No inventory on-hand balance is updated without simultaneously inserting an append-only movement row into `tb_ep_inventory_stk_stock_movement_txn`.
- **Idempotent Webhooks & Payments**: Unique constraint on `(company_code, provider_id, external_event_id)` ensures duplicate webhooks return the cached outcome with `X-Webhook-Duplicate: true`.
- **Transactional Outbox**: Critical domain events are written to `tb_ep_integration_outbox_outbox_event_queue` in the same transaction as the business mutation, guaranteeing zero lost events.
