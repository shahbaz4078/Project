import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { http, setStoredSession, clearSession, getStoredUser, getStoredTokens } from '../services/http.js';

const AuthContext = createContext(null);

/** Maps a backend role string → the user's home dashboard path */
export function roleRoute(role) {
  switch (role) {
    case 'farmer':    return '/farmer';
    case 'processor': return '/distributor';
    case 'retailer':  return '/retailer';
    case 'consumer':  return '/consumer';
    default:          return '/';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return;
    http
      .get('/users/me')
      .then(({ data }) => setUser(data))
      .catch((err) => {
        if (err.response?.status === 401) clearSession();
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await http.post('/auth/login', { email, password });
    setStoredSession(data);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (body) => {
    const { data } = await http.post('/auth/register', body);
    setStoredSession(data);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getStoredTokens().refreshToken;
    try {
      if (refreshToken) await http.post('/auth/logout', { refreshToken });
    } catch {
      /* ignore */
    }
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
