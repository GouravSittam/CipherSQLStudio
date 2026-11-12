/**
 * Authentication Context
 *
 * Manages user authentication state across the application.
 * Provides login, signup, logout functions and current user state.
 *
 * Author: Gourav Chaudhary
 */

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as api from "../services/api.ts";
import type { User } from "../types.ts";

type AuthResult = { success: true } | { success: false; error: string };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (username: string, email: string, password: string, fullName: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(api.TOKEN_KEY)));
  const [error, setError] = useState<string | null>(null);

  // Restore the session if we already have a token
  useEffect(() => {
    if (!localStorage.getItem(api.TOKEN_KEY)) return;

    api
      .getCurrentUser()
      .then((data) => setUser(data.user))
      .catch((err: unknown) => {
        console.error("Failed to load user:", err);
        localStorage.removeItem(api.TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback((token: string, nextUser: User) => {
    localStorage.setItem(api.TOKEN_KEY, token);
    setUser(nextUser);
    setError(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const response = await api.login(email, password);
        startSession(response.token, response.user);
        return { success: true };
      } catch (err) {
        const message = api.getErrorMessage(err, "Login failed. Please try again.");
        setError(message);
        return { success: false, error: message };
      }
    },
    [startSession],
  );

  const signup = useCallback(
    async (username: string, email: string, password: string, fullName: string): Promise<AuthResult> => {
      try {
        const response = await api.signup(username, email, password, fullName);
        startSession(response.token, response.user);
        return { success: true };
      } catch (err) {
        const message = api.getErrorMessage(err, "Signup failed. Please try again.");
        setError(message);
        return { success: false, error: message };
      }
    },
    [startSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(api.TOKEN_KEY);
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, isAuthenticated: Boolean(user), login, signup, logout }),
    [user, loading, error, login, signup, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
