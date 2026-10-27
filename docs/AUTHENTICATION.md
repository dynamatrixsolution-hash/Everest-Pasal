# Everest Pasal — Authentication Architecture

## 1. Identity Data Model (`ep_identity`)

The Everest Pasal authentication system is built directly on top of the physical `ep_identity` tables in PostgreSQL:

- **Users**: `tb_ep_identity_user_user_master` — Account details, email/mobile verification status, user type (`CUSTOMER`, `VENDOR`, `ADMIN`, `SUPER_ADMIN`, `OPERATOR`).
- **Credentials**: `tb_ep_identity_auth_credential_master` — Bcrypt-hashed password storage (Salt rounds = 10) with credential type scoping (`PASSWORD`, `OAUTH`).
- **Sessions**: `tb_ep_admin_log_session_master` — Secure sessions storing SHA256 hashes of tokens, client IP address, device ID, expiration timestamps, and explicit revocation tracking.
- **OTP Challenges**: `tb_ep_identity_auth_otp_txn` — Rate-limited challenge verification with cryptographic hash verification and atomic consumption timestamps (`used_at`).

---

## 2. Token Strategy

1. **Dual Session Architecture**:
   - Client receives a signed JWT access token containing standard claims (`userId`, `userCode`, `email`, `userType`, `companyCode`, `sessionId`).
   - Server registers a cryptographic SHA256 session token hash in `tb_ep_admin_log_session_master` enabling instantaneous token revocation.
2. **Password Security**:
   - Zero plaintext password storage.
   - All passwords are verified using `bcrypt.compare`.
3. **Password Reset Flow**:
   - `POST /api/v1/auth/forgot-password` produces a cryptographically secure 24-byte hex token stored in `tb_ep_identity_auth_otp_txn` with a 1-hour expiration.
   - `POST /api/v1/auth/reset-password` validates the unconsumed token, updates the bcrypt hash in `tb_ep_identity_auth_credential_master`, and stamps `used_at = clock_timestamp()`.
