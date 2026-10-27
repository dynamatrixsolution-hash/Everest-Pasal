# EVEREST PASAL — AUTHENTICATION & ACCESS CONTROL DATABASE SPECIFICATION
## Phase 1 Production Architecture & Data Dictionary

---

## 1. DOMAIN OVERVIEW

The **Identity & Access Control Domain** provides centralized, multi-participant identity management, credential security, revocable session tracking, rate-limited verification, and granular Role-Based Access Control (RBAC) across the entire Everest Pasal ecosystem.

### Architectural Tenets
1. **Single Centralized Identity**: All participants (Customers, Vendors, Platform Admins, Support Agents, Affiliates) exist as a single record in the `Account` table with role assignments and scoped profiles.
2. **Zero Plaintext Secrets**: Passwords use bcrypt (`cost >= 10`), while sessions, verification tokens, reset tokens, and OTPs persist strictly as `SHA-256` hashes in the database.
3. **Auditability**: Every security event (login, failed login, registration, role change, password reset, session revocation) is captured in `AuthenticationEvent`.
4. **Multi-Tenant Org Scoping**: Vendor permissions are bound through `RoleAssignment.organizationId`, preventing cross-vendor data leakage.

---

## 2. PHYSICAL TABLES DATA DICTIONARY

### 2.1 `Account`
**Purpose**: Central user identity for all marketplace actors.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique account identifier |
| `email` | `TEXT` | `UNIQUE`, Nullable | Primary login email address |
| `phone` | `TEXT` | `UNIQUE`, Nullable | Primary login mobile number |
| `passwordHash` | `TEXT` | Nullable | bcrypt password hash |
| `fullName` | `TEXT` | `NOT NULL` | Legal or display full name |
| `status` | `AccountStatus` | `DEFAULT 'ACTIVE'` | `ACTIVE`, `SUSPENDED`, `DEACTIVATED` |
| `emailVerified` | `BOOLEAN` | `DEFAULT false` | Flag indicating confirmed email ownership |
| `phoneVerified` | `BOOLEAN` | `DEFAULT false` | Flag indicating confirmed mobile ownership |
| `lastLoginAt` | `TIMESTAMP(3)` | Nullable | Timestamp of most recent successful login |
| `deletedAt` | `TIMESTAMP(3)` | Nullable | Soft-delete marker |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Account creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last update timestamp |

**Indexes**:
- `Account_email_idx` on `(email)`
- `Account_phone_idx` on `(phone)`
- `Account_status_idx` on `(status)`
- `Account_deletedAt_idx` on `(deletedAt)`

---

### 2.2 `Session`
**Purpose**: Server-side session and refresh token persistence.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique session identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE CASCADE` | Associated account |
| `tokenHash` | `TEXT` | `UNIQUE`, `NOT NULL` | `SHA-256` hash of raw session token |
| `deviceInfo` | `TEXT` | Nullable | Client User-Agent / device metadata |
| `ipAddress` | `TEXT` | Nullable | IP address at session creation |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Session expiry timestamp |
| `lastUsedAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Timestamp of last activity |
| `revokedAt` | `TIMESTAMP(3)` | Nullable | Session revocation timestamp |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Session creation timestamp |

**Indexes**:
- `Session_tokenHash_key` (UNIQUE)
- `Session_accountId_idx` on `(accountId)`
- `Session_tokenHash_idx` on `(tokenHash)`
- `Session_accountId_revokedAt_idx` on `(accountId, revokedAt)`
- `Session_expiresAt_idx` on `(expiresAt)`

---

### 2.3 `VerificationToken`
**Purpose**: Multi-purpose email and phone ownership confirmation tokens.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique token identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE CASCADE` | Target account |
| `purpose` | `VerificationPurpose` | `NOT NULL` | `EMAIL_VERIFICATION`, `PHONE_VERIFICATION` |
| `tokenHash` | `TEXT` | `NOT NULL` | `SHA-256` hash of raw verification token |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Token expiration timestamp (24h default) |
| `usedAt` | `TIMESTAMP(3)` | Nullable | Single-use consumption timestamp |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Token creation timestamp |

**Constraints & Indexes**:
- `UNIQUE (accountId, purpose, tokenHash)`
- `VerificationToken_accountId_purpose_idx` on `(accountId, purpose)`
- `VerificationToken_tokenHash_idx` on `(tokenHash)`
- `VerificationToken_expiresAt_idx` on `(expiresAt)`

---

### 2.4 `PasswordResetToken`
**Purpose**: Time-bounded, single-use credentials for password recovery.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique reset record identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE CASCADE` | Target account |
| `tokenHash` | `TEXT` | `UNIQUE`, `NOT NULL` | `SHA-256` hash of raw reset token |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Token expiration timestamp (60 min default) |
| `usedAt` | `TIMESTAMP(3)` | Nullable | Consumption timestamp |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Issuance timestamp |

**Indexes**:
- `PasswordResetToken_tokenHash_key` (UNIQUE)
- `PasswordResetToken_accountId_idx` on `(accountId)`
- `PasswordResetToken_tokenHash_idx` on `(tokenHash)`
- `PasswordResetToken_expiresAt_idx` on `(expiresAt)`

---

### 2.5 `OtpRecord`
**Purpose**: Rate-limited OTP codes for mobile verification and passwordless authentication.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique OTP record identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE CASCADE`, Nullable | Linked account if known |
| `destination` | `TEXT` | `NOT NULL` | Phone number or email address |
| `purpose` | `OtpPurpose` | `NOT NULL` | `PHONE_LOGIN`, `PHONE_VERIFICATION`, `EMAIL_LOGIN`, `TWO_FACTOR` |
| `otpHash` | `TEXT` | `NOT NULL` | `SHA-256` hash of the 6-digit OTP |
| `attemptCount` | `INTEGER` | `DEFAULT 0` | Number of failed verification attempts |
| `maxAttempts` | `INTEGER` | `DEFAULT 5` | Maximum allowed attempts before lockout |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Expiry timestamp (10 min default) |
| `usedAt` | `TIMESTAMP(3)` | Nullable | Timestamp when successfully consumed |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Issuance timestamp |

**Indexes**:
- `OtpRecord_destination_purpose_idx` on `(destination, purpose)`
- `OtpRecord_expiresAt_idx` on `(expiresAt)`

---

### 2.6 `AccountIdentity`
**Purpose**: Federated OAuth social login provider bindings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique identity identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE CASCADE` | Anchor account |
| `provider` | `AuthProvider` | `NOT NULL` | `GOOGLE`, `FACEBOOK`, `APPLE`, `GITHUB` |
| `providerAccountId` | `TEXT` | `NOT NULL` | Provider's unique subject identifier |
| `accessTokenHash` | `TEXT` | Nullable | `SHA-256` hash of provider access token |
| `refreshTokenHash` | `TEXT` | Nullable | `SHA-256` hash of provider refresh token |
| `tokenExpiresAt` | `TIMESTAMP(3)` | Nullable | Provider token expiration |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Link creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last update timestamp |

**Constraints & Indexes**:
- `UNIQUE (provider, providerAccountId)`
- `AccountIdentity_accountId_idx` on `(accountId)`
- `AccountIdentity_provider_idx` on `(provider)`

---

### 2.7 `Permission`
**Purpose**: Fine-grained business permissions catalog.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique permission identifier |
| `code` | `TEXT` | `UNIQUE`, `NOT NULL` | Dot-notated code e.g. `product:create` |
| `description` | `TEXT` | Nullable | Human-readable explanation |
| `domain` | `TEXT` | `NOT NULL` | Functional domain (e.g. `CATALOG`, `ORDER`, `ADMIN`) |
| `isActive` | `BOOLEAN` | `DEFAULT true` | Availability flag |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Creation timestamp |

**Indexes**:
- `Permission_code_key` (UNIQUE)
- `Permission_domain_idx` on `(domain)`
- `Permission_code_idx` on `(code)`

---

### 2.8 `RolePermission`
**Purpose**: Many-to-many junction binding `UserRole` to `Permission`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique junction identifier |
| `role` | `UserRole` | `NOT NULL` | Target role enum |
| `permissionId` | `TEXT` | `FOREIGN KEY` → `Permission(id) ON DELETE CASCADE` | Assigned permission |
| `grantedAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Grant timestamp |

**Constraints & Indexes**:
- `UNIQUE (role, permissionId)`
- `RolePermission_role_idx` on `(role)`
- `RolePermission_permissionId_idx` on `(permissionId)`

---

### 2.9 `AuthenticationEvent`
**Purpose**: Immutable governance audit log for all identity operations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, UUID | Unique event identifier |
| `accountId` | `TEXT` | `FOREIGN KEY` → `Account(id) ON DELETE SET NULL`, Nullable | Associated account |
| `eventType` | `AuthEventType` | `NOT NULL` | Event classifier enum |
| `ipAddress` | `TEXT` | Nullable | Client IP address |
| `userAgent` | `TEXT` | Nullable | Client User-Agent string |
| `metadata` | `JSONB` | Nullable | Contextual details (no secrets) |
| `occurredAt` | `TIMESTAMP(3)` | `DEFAULT now()` | Event timestamp |

**Indexes**:
- `AuthenticationEvent_accountId_idx` on `(accountId)`
- `AuthenticationEvent_eventType_idx` on `(eventType)`
- `AuthenticationEvent_accountId_occurredAt_idx` on `(accountId, occurredAt)`
- `AuthenticationEvent_occurredAt_idx` on `(occurredAt)`

---

## 3. ENUMS REFERENCE

```prisma
enum AccountStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum UserRole {
  CUSTOMER
  VENDOR_ADMIN
  VENDOR_STAFF
  PLATFORM_ADMIN
  FINANCE_ADMIN
  SUPPORT_AGENT
}

enum RoleStatus {
  ACTIVE
  REVOKED
}

enum VerificationPurpose {
  EMAIL_VERIFICATION
  PHONE_VERIFICATION
}

enum OtpPurpose {
  PHONE_LOGIN
  PHONE_VERIFICATION
  EMAIL_LOGIN
  TWO_FACTOR
}

enum AuthProvider {
  GOOGLE
  FACEBOOK
  APPLE
  GITHUB
}

enum AuthEventType {
  REGISTER
  LOGIN_SUCCESS
  LOGIN_FAILED
  LOGOUT
  PASSWORD_CHANGED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  EMAIL_VERIFIED
  PHONE_VERIFIED
  SESSION_REVOKED
  ROLE_ASSIGNED
  ROLE_REVOKED
  ACCOUNT_SUSPENDED
  ACCOUNT_REACTIVATED
  OTP_REQUESTED
  OTP_VERIFIED
  OTP_FAILED
  OAUTH_LINKED
}
```

---

## 4. RELATIONAL ARCHITECTURE & SECURITY CONTROLS

```
Account
  ├── Session[]               (1:N, Cascade Delete, SHA-256 token lookup)
  ├── VerificationToken[]     (1:N, Cascade Delete, Single-Use Expiring)
  ├── PasswordResetToken[]    (1:N, Cascade Delete, Revokes Sessions)
  ├── OtpRecord[]             (1:N, Cascade Delete, Max 5 Attempts Rate-Limit)
  ├── AccountIdentity[]       (1:N, Cascade Delete, Unique provider + sub)
  ├── RoleAssignment[]        (1:N, Cascade Delete, Scoped by Org)
  │     └── Organization?     (Optional Vendor Scoping)
  └── AuthenticationEvent[]   (1:N, Set Null on Delete, Append-Only)

UserRole (Enum)
  └── RolePermission[]        (N:M Junction)
        └── Permission        (Fine-Grained Code Catalog)
```
