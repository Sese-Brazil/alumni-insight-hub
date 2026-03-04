import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DEMO_USERS, User } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeFirstLogin: () => void;
  completeSurvey: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('tracer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (userId: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const entry = DEMO_USERS[userId];
    if (!entry || entry.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Invalid credentials. Please check your User ID and password.' };
    }
    setUser(entry.user);
    sessionStorage.setItem('tracer_user', JSON.stringify(entry.user));
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('tracer_user');
  }, []);

  const completeFirstLogin = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, firstLogin: false };
      sessionStorage.setItem('tracer_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeSurvey = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, surveyCompleted: true };
      sessionStorage.setItem('tracer_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem('tracer_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, completeFirstLogin, completeSurvey, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
