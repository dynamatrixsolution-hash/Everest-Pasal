# Everest Pasal — Comprehensive API Documentation (v1)

## Base URL
- Local Environment: `http://localhost:4000/api/v1`
- Production Gateway: `https://api.everestpasal.com/api/v1`

All responses follow the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable status",
  "meta": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

---

## 1. System & Geography

### `GET /api/v1/system/companies`
- **Purpose**: Retrieve authorized multi-tenant company details.
- **Auth**: Public
- **Response**: `200 OK` — Array of companies with legal and currency settings.

### `GET /api/v1/system/fiscal-years`
- **Purpose**: Retrieve current and historical fiscal year ranges for accounting.
- **Auth**: Public
- **Response**: `200 OK` — Fiscal years list.

### `GET /api/v1/geo/countries` | `/provinces` | `/districts` | `/municipalities` | `/delivery-zones`
- **Purpose**: Geographic cascade selectors and delivery tier boundaries in Nepal.
- **Auth**: Public
- **Response**: `200 OK` — Geographic hierarchies.

---

## 2. Identity & Authentication (`ep_identity`)

### `POST /api/v1/auth/register`
- **Purpose**: Create a new account and password credential.
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "StrongPassword123!",
    "fullName": "Bishal Shrestha",
    "role": "CUSTOMER"
  }
  ```
- **Response**: `201 Created` — AuthResponse with JWT token and active session hash.

### `POST /api/v1/auth/login`
- **Purpose**: Verify password hash against `tb_ep_identity_auth_credential_master` and issue session.
- **Body**:
  ```json
  {
    "identifier": "customer@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response**: `200 OK` — Authenticated payload with user roles and session token.

### `POST /api/v1/auth/request-otp`
- **Purpose**: Generate 6-digit challenge code and store SHA256 in `tb_ep_identity_auth_otp_txn`.
- **Body**: `{ "destination": "customer@example.com", "purpose": "LOGIN_VERIFICATION" }`
- **Response**: `200 OK`

### `POST /api/v1/auth/verify-otp`
- **Purpose**: Validate OTP challenge and mark `used_at = clock_timestamp()`.
- **Body**: `{ "destination": "customer@example.com", "code": "123456", "purpose": "LOGIN_VERIFICATION" }`
- **Response**: `200 OK` — `{ "verified": true }`

---

## 3. Customer Profile & Addresses (`ep_customer`)

### `GET /api/v1/customer/profile`
- **Purpose**: Retrieve authenticated customer profile.
- **Auth**: Bearer Token
- **Response**: `200 OK` — Profile details.

### `POST /api/v1/customer/addresses`
- **Purpose**: Add shipping/billing address in `tb_ep_customer_address_address_detail`.
- **Body**:
  ```json
  {
    "recipientName": "Bishal Shrestha",
    "recipientPhone": "9841234567",
    "addressLine1": "Lazimpat, Ward 2",
    "cityCode": "KTM",
    "isDefault": true
  }
  ```
- **Response**: `201 Created`

---

## 4. KYC / KYB Verification (`ep_kyc`)

### `GET /api/v1/kyc/me`
- **Purpose**: Retrieve or initialize KYC case for the authenticated participant.
- **Auth**: Bearer Token
- **Response**: `200 OK` — Subject, Case, and Document checklist.

### `POST /api/v1/kyc/documents`
- **Purpose**: Register verified document with SHA256 checksum in `tb_ep_kyc_document_document_master`.
- **Body**:
  ```json
  {
    "documentType": "CITIZENSHIP",
    "documentNumber": "27-01-78-01234",
    "fileReference": "https://everestpasal.com/uploads/citizenship.pdf"
  }
  ```
- **Response**: `201 Created`

### `POST /api/v1/kyc/submit`
- **Purpose**: Transition KYC case status from `DRAFT` to `SUBMITTED` for compliance review.
- **Auth**: Bearer Token
- **Response**: `200 OK`

---

## 5. Catalog & Search (`ep_catalog`)

### `GET /api/v1/products`
- **Purpose**: List active, published products.
- **Query**: `?page=1&pageSize=20&categoryId=...`
- **Response**: `200 OK` — Paginated products with default variant and media.

### `GET /api/v1/search/products`
- **Purpose**: Indexed text and attribute search across catalog offerings.
- **Query**: `?q=tea&minPrice=100&maxPrice=1000`
- **Response**: `200 OK` — Matching search results.

---

## 6. Inventory (`ep_inventory`)

### `POST /api/v1/inventory/adjust`
- **Purpose**: Adjust stock quantities with mandatory audit record in `tb_ep_inventory_stk_stock_movement_txn`.
- **Auth**: Bearer Token (Vendor / Admin)
- **Body**:
  ```json
  {
    "warehouseId": "UUID",
    "listingVariantId": "UUID",
    "quantityDelta": 50,
    "movementType": "PURCHASE_RECEIPT",
    "reasonCode": "INITIAL_STOCK_SEED"
  }
  ```
- **Response**: `200 OK` — Stock item and movement transaction.

---

## 7. Commerce, Cart & Orders (`ep_commerce`)

### `GET /api/v1/cart`
- **Purpose**: Retrieve customer cart with real-time price joins.
- **Auth**: Bearer Token (Customer)
- **Response**: `200 OK` — Cart basket.

### `POST /api/v1/cart/items`
- **Purpose**: Add variant offer to cart.
- **Body**: `{ "offerId": "UUID", "quantity": 2 }`
- **Response**: `200 OK`

### `POST /api/v1/checkout/orders`
- **Purpose**: Atomically create customer order, vendor fulfillment units, and charges.
- **Auth**: Bearer Token (Customer)
- **Body**:
  ```json
  {
    "shippingAddressId": "UUID",
    "paymentMethod": "ESEWA",
    "notes": "Deliver during afternoon"
  }
  ```
- **Response**: `201 Created` — Durable Order details and payment intent reference.

---

## 8. Payments & Webhooks (`ep_payment`)

### `POST /api/v1/payments/intents`
- **Purpose**: Create payment intent in `tb_ep_payment_intent_payment_intent_master`.
- **Body**: `{ "orderId": "UUID", "amount": 1500, "providerCode": "ESEWA" }`
- **Response**: `201 Created`

### `POST /api/v1/payments/webhooks`
- **Purpose**: Receive asynchronous payment notifications with idempotent duplicate rejection.
- **Headers**: `X-Event-ID: evt_12345`
- **Response**: `200 OK` (`X-Webhook-Duplicate: true` if already seen).

---

## 9. Finance & General Ledger (`ep_finance`)

### `POST /api/v1/finance/journals`
- **Purpose**: Record double-entry financial journal. Enforces sum(Debits) == sum(Credits).
- **Auth**: Bearer Token (Finance Admin)
- **Body**:
  ```json
  {
    "journalDate": "2026-10-01",
    "lines": [
      { "accountId": "UUID", "debit": 500, "credit": 0, "memo": "Cash In" },
      { "accountId": "UUID", "debit": 0, "credit": 500, "memo": "Sales Revenue" }
    ]
  }
  ```
- **Response**: `201 Created`

---

## 10. Audit Logs (`ep_audit`)

### `GET /api/v1/audit/activity`
- **Purpose**: Query append-only security and operational audit trail.
- **Auth**: Bearer Token (Admin)
- **Response**: `200 OK` — Paginated audit log records.
