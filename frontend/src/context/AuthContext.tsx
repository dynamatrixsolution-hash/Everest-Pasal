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
  roles: UserRoleAssignment[];
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await ApiClient.get<{ user: UserProfile }>('/auth/me');
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
        ApiClient.clearToken();
      }
    } catch (err) {
      console.warn('[AUTH] Session verification failed, clearing token.');
      setUser(null);
      ApiClient.clearToken();
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
        account: UserProfile;
        session: { token: string };
      }>('/auth/login', { identifier, password });

      if (res.session && res.session.token) {
        ApiClient.setToken(res.session.token);
        setUser(res.account);
      }
      return res.account;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<{
        account: UserProfile;
        session: { token: string };
      }>('/auth/register', data);

      if (res.session && res.session.token) {
        ApiClient.setToken(res.session.token);
        setUser(res.account);
      }
      return res.account;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network failure on logout
    } finally {
      ApiClient.clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
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
