'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiPost } from '@/lib/api';
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
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type RefreshUserResult =
  | { kind: 'authenticated'; user: User }
  | { kind: 'anonymous'; status: number }
  | { kind: 'rate_limited'; status: number }
  | { kind: 'network_error' }
  | { kind: 'server_error'; status: number }
  | { kind: 'parse_error'; status: number };

function disabledLocalAuthError(message: string): Error {
  return new Error(message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (): Promise<RefreshUserResult> => {
    let response: Response;
    try {
      response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    } catch {
      return { kind: 'network_error' };
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      return { kind: 'parse_error', status: response.status };
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return { kind: 'anonymous', status: response.status };
      if (response.status === 429) return { kind: 'rate_limited', status: response.status };
      return { kind: 'server_error', status: response.status };
    }

    const envelope = body as {
      success?: boolean;
      data?: {
        id: string;
        name?: string;
        email: string | null;
        phone: string | null;
        avatar?: string | null;
        avatarUrl?: string | null;
        role: string;
        roles?: string[];
        permissions?: string[];
      };
    };

    if (!envelope?.success || !envelope?.data?.id) return { kind: 'anonymous', status: response.status };

    return {
      kind: 'authenticated',
      user: {
        id: envelope.data.id,
        name: envelope.data.name ?? '',
        email: envelope.data.email,
        phone: envelope.data.phone,
        avatarUrl: envelope.data.avatarUrl ?? envelope.data.avatar ?? null,
        role: envelope.data.role,
        roles: envelope.data.roles ?? [envelope.data.role],
        permissions: envelope.data.permissions ?? [],
      },
    };
  };

  const refreshUser = async (): Promise<User | null> => {
    let outcome: RefreshUserResult = { kind: 'network_error' };
    try {
      outcome = await fetchCurrentUser();
      if (outcome.kind === 'authenticated') {
        setUser(outcome.user);
        return outcome.user;
      }
      setUser(null);
      return null;
    } finally {
      if (typeof window !== 'undefined') {
        console.info('[BPA_AUTH_REFRESH_DEBUG]', outcome.kind === 'authenticated'
          ? { kind: outcome.kind, authenticated: true }
          : outcome);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
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
