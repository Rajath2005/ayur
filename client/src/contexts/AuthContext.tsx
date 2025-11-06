import React, { createContext, useContext, useEffect, useState } from 'react';
import { restoreSession, onAuthStateChange, logout as authLogout } from '@/services/auth';
import type { AuthUser } from '@/services/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionUser = await restoreSession();
        setUser(sessionUser);
      } catch (error) {
        console.error('Failed to restore session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const sessionUser = await restoreSession();
      setUser(sessionUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
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
