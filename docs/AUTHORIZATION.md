# Everest Pasal — Authorization & Multi-Tenancy Security Model

## 1. Role-Based Access Control (RBAC) Architecture

Authorization in Everest Pasal is determined strictly on the backend across three orthogonal axes:
1. **Participant Role**: `CUSTOMER`, `VENDOR`, `ADMIN`, `SUPER_ADMIN`, `OPERATOR`, `RIDER`, `SUPPORT_AGENT`.
2. **Explicit Permissions**: Evaluated via `tb_ep_identity_permission_permission_master` and `tb_ep_identity_role_role_permission_map`.
3. **Multi-Tenancy Company Scope**: Hard isolation across `company_code` boundaries.

---

## 2. Participant Isolation Rules

### Customer Boundary
- A customer can only access their own profile (`tb_ep_customer_profile_customer_master`), orders (`tb_ep_commerce_ord_order_master`), addresses, support tickets, and saved cards.
- Tampering with UUID route parameters (e.g. attempting to fetch another customer's `/api/v1/orders/:id`) is rejected with `403 Forbidden` or `404 Not Found`.

### Vendor Boundary
- A vendor can only view/mutate products, stock items, fulfillment units, settlements, and payouts linked to their authorized `merchant_id` / `organizationId`.
- Never trust `vendorId` or `merchantId` submitted in request bodies or query parameters. The server resolves vendor ownership from the authenticated JWT session.

### Admin Boundary
- Administrative endpoints (`/api/v1/admin/*`, `/api/v1/finance/*`) require staff roles (`ADMIN`, `SUPER_ADMIN`, `OPERATOR`, `FINANCE_ADMIN`).
- Sensitive operations (e.g. KYC approval, payout execution, journal posting) are validated against role permissions.
