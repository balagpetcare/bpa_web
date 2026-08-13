'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';
import { buildCentralAuthLogoutUrl } from '@/lib/auth/central-auth';

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  requestOtp: (phone: string) => Promise<{ success: boolean; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_COOKIE_NAME = 'bpa_user_session';

function hasAuthCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
}

function disabledLocalAuthError(message: string): Error {
  return new Error(message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiFetch<{
        id: string;
        name?: string;
        email: string | null;
        phone: string | null;
        avatar?: string | null;
        avatarUrl?: string | null;
        role: string;
        roles?: string[];
        permissions?: string[];
      }>('/auth/me');
      if (res.success) {
        setUser({
          id: res.data.id,
          name: res.data.name ?? '',
          email: res.data.email,
          phone: res.data.phone,
          avatarUrl: res.data.avatarUrl ?? res.data.avatar ?? null,
          role: res.data.role,
          roles: res.data.roles ?? [res.data.role],
          permissions: res.data.permissions ?? [],
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAuthCookie()) {
      void refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (_email: string, _password: string) => {
    throw disabledLocalAuthError('Direct BPA login is disabled. Please continue with WPA Central Auth.');
  };

  const register = async (_data: Record<string, unknown>) => {
    throw disabledLocalAuthError('Direct BPA registration is disabled. Please continue with WPA Central Auth.');
  };

  const requestOtp = async (_phone: string) => {
    throw disabledLocalAuthError('Direct BPA OTP login is disabled. Please continue with WPA Central Auth.');
  };

  const verifyOtp = async (_phone: string, _otp: string) => {
    throw disabledLocalAuthError('Direct BPA OTP login is disabled. Please continue with WPA Central Auth.');
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.assign(buildCentralAuthLogoutUrl());
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
