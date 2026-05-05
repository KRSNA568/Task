import { createContext, useContext, useState, useRef, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const tokenRef = useRef(null);

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
    <AuthContext.Provider value={{ user, tokenRef, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
