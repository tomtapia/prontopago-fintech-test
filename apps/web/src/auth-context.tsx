import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LoginResult } from './lib/api.js';

interface AuthState {
  token: string | null;
  user: LoginResult['user'] | null;
  loginSuccess: (r: LoginResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const TOKEN_KEY = 'pp_token';
const USER_KEY = 'pp_user';

function loadInitial(): { token: string | null; user: LoginResult['user'] | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    return { token, user: raw ? (JSON.parse(raw) as LoginResult['user']) : null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitial);
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<LoginResult['user'] | null>(initial.user);

  const loginSuccess = (r: LoginResult) => {
    setToken(r.token);
    setUser(r.user);
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };
  return <AuthContext.Provider value={{ token, user, loginSuccess, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
