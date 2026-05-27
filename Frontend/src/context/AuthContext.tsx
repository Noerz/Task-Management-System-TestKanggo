import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import type { User, RegisterPayload, LoginPayload } from '../services/authService';
import { isTokenValid } from '../utils/jwt';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean; // true while checking stored session on app mount
  user: User | null;
  isLoading: boolean;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * isInitializing: stays true until we finish checking the stored token.
   * While true, the app renders nothing (prevents flash of login page).
   */
  const [isInitializing, setIsInitializing] = useState(true);

  // ── On app mount: validate stored token ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (isTokenValid(token)) {
      // Token still valid → restore user from storage
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Token exists but user data is missing → clear and force re-login
        clearSession();
      }
    } else {
      // Token missing or expired → wipe storage silently
      clearSession();
    }

    setIsInitializing(false);
  }, []);

  const isAuthenticated = !!user;

  // ── Actions ────────────────────────────────────────────────────────────────

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await authService.register(payload);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const result = await authService.login(payload);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Even if server logout fails, clear local state
    } finally {
      clearSession();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
