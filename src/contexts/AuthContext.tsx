'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';
import apiClient from '@/api/client';
import { User, LoginRequest, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only access localStorage after component is mounted on client
    const storedUser = Cookies.get('user') || (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Cookies (cho Middleware đọc được server-side)
    Cookies.set('token', data.token, { sameSite: 'Lax' });
    if (data.refresh_token) {
      Cookies.set('refresh_token', data.refresh_token, { sameSite: 'Lax' });
    }
    Cookies.set('user', JSON.stringify(data.user), { sameSite: 'Lax' });
    Cookies.set('role', data.user.role, { sameSite: 'Lax' });

    // LocalStorage (cho client-side persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
    }

    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore logout API errors
    }
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    Cookies.remove('role');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
