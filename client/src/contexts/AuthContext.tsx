// client/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { restoreSession, onAuthStateChange, logout as authLogout, getCurrentUser } from "@/services/auth";
import type { AuthUser } from "@/services/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getCurrentUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log("Initializing auth...");

        const sessionUser = await restoreSession();

        if (!mounted) return;

        console.log("Session restored:", sessionUser ? "User found" : "No user");
        setUser(sessionUser);
      } catch (err) {
        console.error("Failed to restore session:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    initialize();

    // Listen to auth state changes
    const subscription = onAuthStateChange((authUser) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", authUser ? "User signed in" : "User signed out");
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await restoreSession();
      setUser(u);
    } catch (err) {
      console.error("Refresh user error:", err);
      setUser(null);
    }
  }, []);

  const getCurrent = useCallback(async () => {
    return getCurrentUser();
  }, []);

  // Don't render children until initial auth check is complete
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, getCurrentUser: getCurrent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}