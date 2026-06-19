'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, apiPost } from '@/lib/api';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiFetch<User>('/auth/me');
      if (res.success) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiPost<{ user: User }>('/auth/login', { email, password });
    if (res.success) {
      setUser(res.data.user);
    }
  };

  const register = async (data: Record<string, unknown>) => {
    const res = await apiPost<{ user: User }>('/auth/register/email', data);
    if (res.success) {
      setUser(res.data.user);
    }
  };

  const requestOtp = async (phone: string) => {
    const res = await apiPost<{ devOtp?: string; success: boolean }>('/auth/mobile/request-otp', { phone });
    return res.data;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await apiPost<{ user: User }>('/auth/mobile/verify-otp', { phone, otp });
    if (res.success) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
    } finally {
      setUser(null);
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
