// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { loginApi, registerApi, saveToken, loadToken, clearToken } from "@/lib/api";

interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string | null, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Minimal JWT payload extractor to read id/email from token (no signature verification)
function decodeJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => loadToken());
  const [user, setUser] = useState<User | null>(() => {
    const p = decodeJwt(loadToken());
    return p ? { id: p.id || p.sub, email: p.email } : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) saveToken(token);
    else clearToken();
    const payload = decodeJwt(token);
    if (payload) setUser({ id: payload.id || payload.sub, email: payload.email });
    else setUser(null);
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, password);
      if (data?.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error("login error", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (_name: string | null, email: string, password: string): Promise<boolean> => {
    // _name preserved for UI, backend currently stores only email/password + id
    setIsLoading(true);
    try {
      const data = await registerApi(email, password);
      if (data?.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error("register error", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
