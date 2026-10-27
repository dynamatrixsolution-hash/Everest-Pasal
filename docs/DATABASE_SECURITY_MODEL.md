# Everest Pasal - Database Security Architecture & Access Control Model

Authoritative Specification: `Everest_Pasal_Database_Design_Documentation.docx`

---

## 1. Application Surface Separation Model

The platform enforces strict separation between three distinct application surfaces:

```
                  +----------------------------------------------+
                  |         Unified PostgreSQL Database          |
                  |             (21 Schemas / 183 Tables)        |
                  +----------------------------------------------+
                                       ^
                                       | Database Connection & Row-Level Authorization
                  +--------------------+--------------------+
                  |                                         |
+-----------------------------------+     +-----------------------------------+     +-----------------------------------+
|       Customer Web Surface        |     |       Vendor Panel Surface        |     |        Admin Panel Surface        |
|  - Public storefront              |     |  - Merchant portal                |     |  - Superadmin operations          |
|  - Customer account & orders      |     |  - Merchant catalog & stock       |     |  - Global financial audit         |
|  - Cart, checkout, wishlist       |     |  - Fulfillment & settlements      |     |  - KYC review & approval          |
+-----------------------------------+     +-----------------------------------+     +-----------------------------------+
```

### Security Invariants:
1. **No Client-Side Surface Switcher**: Surface access is determined strictly server-side through user role mapping (`tb_ep_identity_role_user_role_map`) and session scope checks.
2. **Authentication vs Authorization**:
   - **Authentication**: Validates that the caller is who they claim to be (`tb_ep_identity_user_user_master`, `tb_ep_identity_auth_credential_master`, `tb_ep_admin_log_session_master`).
   - **Authorization**: Determines which surface, tables, and tenant/merchant scope the authenticated user is permitted to interact with (`tb_ep_identity_role_role_master`, `tb_ep_identity_permission_permission_master`).
3. **Cross-Tenant & Cross-Merchant Isolation**:
   - A Vendor User mapped to `Merchant A` has their queries automatically filtered by `merchant_id = 'Merchant_A_UUID'`.
   - Access to `Merchant B`'s records returns an immediate `403 Forbidden` or `404 Not Found`.

---

## 2. PII Protection, Masking & Cryptographic Standards

### 2.1 Financial & Payment Tokenization
- **Payment Cards**: Raw credit/debit card primary account numbers (PAN) and CVVs are **NEVER** stored in the database.
- **Provider Tokens**: Stored exclusively as references (`payment_token_reference`, `provider_reference`) in `tb_ep_customer_saved_payment_reference` and `tb_ep_payment_intent_payment_intent_master`.
- **Bank Account Display**: Stored as masked strings (`account_no_masked`, e.g., `XXXX-XXXX-1234`) in `tb_ep_merchant_bank_bank_account_master`.

### 2.2 KYC & Identity Evidence Security
- **Document Numbers**:
  - Masked form: `document_no_masked` (e.g. `PP-XXXX987`).
  - Searchable hash: `document_no_hash` (one-way SHA-256 HMAC) for duplicate fraud detection.
  - Encrypted storage: `document_no_encrypted` (AES-256-GCM bytea) when legal compliance mandates retention.
- **Evidence Files**: Stored in encrypted cloud object storage buckets with ephemeral signed URLs. The database records only the internal object reference (`file_reference`) and SHA-256 integrity checksum (`checksum_sha256`) in `tb_ep_kyc_document_document_master`.
- **Publish Status**: In `ep_kyc`, `publish` is permanently constrained to `false`.

### 2.3 Secret References
- Configuration tables (`tb_ep_system_company_ftp_setup`, `tb_ep_system_company_communication_setup`, `tb_ep_integration_provider_provider_connection_master`) store secret names/keys (`secret_reference`, `credential_reference`) that resolve at runtime against external Secrets Managers (AWS Secrets Manager, Vault, or GCP Secret Manager), never plain-text passwords or API keys.

---

## 3. Comprehensive Audit & Non-Repudiation Architecture

The `ep_audit` schema maintains continuous, immutable auditability across four specialized logging engines:

1. **User Activity Logging (`tb_ep_audit_activity_activity_log`)**:
   Tracks every authenticated user request, API endpoint, IP address, and high-level business action.
2. **Change Data Capture CDC (`tb_ep_audit_entity_entity_change_log`)**:
   Captures granular `before_json` and `after_json` diffs whenever critical entities (pricing, commissions, bank accounts, permissions) are mutated.
3. **Security Event Logging (`tb_ep_audit_security_security_event_log`)**:
   Records unauthorized access attempts, repeated failed OTPs, brute-force detections, privilege escalation triggers, and token revocations.
4. **Data Access Logging (`tb_ep_audit_access_data_access_log`)**:
   Audits all access to sensitive customer PII and merchant financial statements to comply with data privacy regulations.
