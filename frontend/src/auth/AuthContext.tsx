import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { setAccessToken } from "../api/axiosClient";
import { loginRequest, registerRequest, logoutRequest, refreshRequest, type User } from "../api/auth.api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first app load, there's no access token in memory yet (a full page
  // refresh wipes React state) — but the httpOnly refresh cookie may still
  // be valid. Try a silent refresh once on mount to restore the session
  // without forcing a re-login on every browser refresh.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken, user } = await refreshRequest();
        setAccessToken(accessToken);
        setUser(user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await loginRequest(email, password);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { accessToken, user } = await registerRequest(name, email, password);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};