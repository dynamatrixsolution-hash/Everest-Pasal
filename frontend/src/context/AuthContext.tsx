// ==============================================================================
// EVEREST PASAL - AUTHENTICATION STATE CONTEXT
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../api/client.js';

export interface UserRoleAssignment {
  role: string;
  organizationId: string | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  status: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  roles: UserRoleAssignment[];
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: (data: { credential?: string; email?: string; fullName?: string; avatarUrl?: string; googleId?: string }) => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  requestOtp: (destination: string, purpose?: string) => Promise<{ message: string; otp?: string; expiresInSeconds?: number }>;
  verifyOtp: (destination: string, code: string, purpose?: string) => Promise<{ verified: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'ep_user_profile';

function normalizeUser(rawUser: any): UserProfile {
  if (!rawUser) {
    return {
      id: 'usr-default',
      email: null,
      phone: null,
      fullName: 'User',
      status: 'ACTIVE',
      roles: [{ role: 'CUSTOMER', organizationId: null }],
      permissions: ['READ_CATALOG'],
    };
  }

  return {
    id: rawUser.id || 'usr-default',
    email: rawUser.email || null,
    phone: rawUser.phone || rawUser.mobileNo || rawUser.mobile_no || null,
    fullName: rawUser.fullName || rawUser.displayName || rawUser.display_name || (rawUser.email ? rawUser.email.split('@')[0] : 'User'),
    status: rawUser.status || 'ACTIVE',
    emailVerified: rawUser.emailVerified ?? true,
    phoneVerified: rawUser.phoneVerified ?? true,
    roles: Array.isArray(rawUser.roles)
      ? rawUser.roles.map((r: any) =>
          typeof r === 'string'
            ? { role: r, organizationId: null }
            : { role: r?.role || r?.name || 'CUSTOMER', organizationId: r?.organizationId || null }
        )
      : [{ role: 'CUSTOMER', organizationId: null }],
    permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : ['READ_CATALOG'],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {}
  };

  const refreshUser = async () => {
    const token = ApiClient.getToken();
    if (!token) {
      persistUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await ApiClient.get<any>('/auth/me');
      const rawUser = response?.user || response?.account || response?.data?.user || response?.data?.account || response;
      if (rawUser && (rawUser.id || rawUser.email || rawUser.fullName || rawUser.displayName || rawUser.display_name)) {
        persistUser(normalizeUser(rawUser));
      }
    } catch (err: any) {
      // ONLY clear token if the server explicitly responded with 401 Unauthorized
      // If it's a network error (server offline, connection refused, 500, timeout), preserve the existing cached session!
      const is401 = err?.message?.includes('401') || err?.status === 401;
      if (is401) {
        console.warn('[AUTH] Session verification returned 401 Unauthorized, clearing token.');
        ApiClient.clearToken();
        persistUser(null);
      } else {
        console.warn('[AUTH] Server unreachable or network error during refreshUser; keeping cached session:', err?.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<{
        account: any;
        session: { token: string };
      }>('/auth/login', { identifier, password });

      const normalized = normalizeUser(res?.account);
      if (res?.session && res.session.token) {
        ApiClient.setToken(res.session.token);
        persistUser(normalized);
      }
      return normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (data: {
    credential?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<{
        account: any;
        session: { token: string };
      }>('/auth/google', data);

      const normalized = normalizeUser(res?.account);
      if (res?.session && res.session.token) {
        ApiClient.setToken(res.session.token);
        persistUser(normalized);
      }
      return normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<{
        account: any;
        session: { token: string };
      }>('/auth/register', data);

      const normalized = normalizeUser(res?.account);
      if (res?.session && res.session.token) {
        ApiClient.setToken(res.session.token);
        persistUser(normalized);
      }
      return normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (destination: string, purpose: string = 'VERIFICATION'): Promise<{ message: string; otp?: string; expiresInSeconds?: number }> => {
    return await ApiClient.post('/auth/request-otp', { destination, purpose });
  };

  const verifyOtp = async (destination: string, code: string, purpose: string = 'VERIFICATION'): Promise<{ verified: boolean; message: string }> => {
    const res = await ApiClient.post('/auth/verify-otp', { destination, code, purpose });
    // After OTP verification, refresh the user profile so email_verified is true in state
    await refreshUser();
    return res;
  };

  const logout = async () => {
    try {
      await ApiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network failure on logout
    } finally {
      ApiClient.clearToken();
      persistUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
