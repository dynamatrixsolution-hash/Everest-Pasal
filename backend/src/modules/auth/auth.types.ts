// ==============================================================================
// EVEREST PASAL - AUTHENTICATION & IDENTITY MODULE TYPES
// Aligns with Phase 1 Authentication & RBAC Architecture
// ==============================================================================

import { UserRole, AccountStatus, VerificationPurpose, OtpPurpose, AuthProvider, AuthEventType } from '@prisma/client';

export interface RegisterInput {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role?: UserRole;
  organizationId?: string;
}

export interface LoginInput {
  identifier: string; // Email or phone
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface AuthResponse {
  account: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    status: AccountStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    roles: { role: UserRole; organizationId: string | null }[];
    permissions: string[];
  };
  session: {
    id: string;
    token: string; // raw token returned once to client
    expiresAt: string;
  };
}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  status: AccountStatus;
  roles: { role: UserRole; organizationId: string | null }[];
  permissions: string[];
  sessionId?: string;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetConfirmInput {
  token: string;
  newPassword: string;
}

export interface VerifyTokenInput {
  accountId: string;
  purpose: VerificationPurpose;
  token: string;
}

export interface OtpRequestInput {
  destination: string;
  purpose: OtpPurpose;
  accountId?: string;
}

export interface OtpVerifyInput {
  destination: string;
  purpose: OtpPurpose;
  otp: string;
}

export interface OAuthLinkInput {
  accountId: string;
  provider: AuthProvider;
  providerAccountId: string;
  accessToken?: string;
}
