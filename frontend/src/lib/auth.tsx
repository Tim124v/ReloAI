'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { api, TOKEN_KEY } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'PRO';
  monthlyUsage: number;
  freeLimit: number;
  remaining: number | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes idle → logout

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      clearSession();
    }, INACTIVITY_MS);
  };

  const refreshUser = async () => {
    try {
      const data = await api.get<User>('/api/auth/me');
      setUser(data);
    } catch (err: any) {
      // Only clear session on auth errors (401/403), NOT on network errors
      if (err?.status === 401 || err?.status === 403) {
        clearSession();
      }
      // On network/server errors, keep the token — user stays logged in
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Reset inactivity timer on any user activity
  useEffect(() => {
    if (!user) return;
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
