import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authApi, apiClient, ApiClientError } from '@/lib/api';
import type { AuthContextType, AuthStatus, User } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = 'phoenix_access_token';
const REFRESH_TOKEN_KEY = 'phoenix_refresh_token';

function mapUserResponse(data: {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'org_user' | 'org_admin' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}): User {
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    role: data.role,
    isActive: data.is_active,
    createdAt: data.created_at,
    lastLoginAt: data.last_login_at,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.setAccessToken(null);
  }, []);

  const saveTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setAccessToken(accessToken);
  }, []);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await authApi.me();
      return mapUserResponse(userData);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }, []);

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const tokens = await authApi.refresh({ refresh_token: refreshToken });
      saveTokens(tokens.access_token, tokens.refresh_token);
      return true;
    } catch {
      clearTokens();
      return false;
    }
  }, [saveTokens, clearTokens]);

  const initAuth = useCallback(async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!accessToken) {
      setStatus('unauthenticated');
      return;
    }

    apiClient.setAccessToken(accessToken);

    try {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        setStatus('authenticated');
      } else {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const userData = await fetchUser();
          if (userData) {
            setUser(userData);
            setStatus('authenticated');
            return;
          }
        }
        clearTokens();
        setStatus('unauthenticated');
      }
    } catch {
      clearTokens();
      setStatus('unauthenticated');
    }
  }, [fetchUser, tryRefreshToken, clearTokens]);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    saveTokens(tokens.access_token, tokens.refresh_token);

    const userData = await fetchUser();
    if (userData) {
      setUser(userData);
      setStatus('authenticated');
    }
  }, [saveTokens, fetchUser]);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const tokens = await authApi.register({
      email,
      password,
      display_name: displayName
    });
    saveTokens(tokens.access_token, tokens.refresh_token);

    const userData = await fetchUser();
    if (userData) {
      setUser(userData);
      setStatus('authenticated');
    }
  }, [saveTokens, fetchUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {

    } finally {
      clearTokens();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [clearTokens]);

  const refreshAuth = useCallback(async () => {
    const success = await tryRefreshToken();
    if (success) {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        setStatus('authenticated');
        return;
      }
    }
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, [tryRefreshToken, fetchUser, clearTokens]);

  const value: AuthContextType = {
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
