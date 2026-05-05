import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial session check completes
  const tokenRef = useRef(null);

  // On mount: try to restore session using the httpOnly refresh token cookie
  useEffect(() => {
    authApi.refresh()
      .then(({ data }) => {
        const { user: u, accessToken } = data.data;
        setUser(u);
        tokenRef.current = accessToken;
      })
      .catch(() => {
        // No valid session — leave user as null
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    tokenRef.current = accessToken;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    tokenRef.current = null;
  }, []);

  const setToken = useCallback((token) => {
    tokenRef.current = token;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, tokenRef, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
