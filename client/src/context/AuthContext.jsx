import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const tokenKey = 'digital-library-token';
const userKey = 'digital-library-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(userKey);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [token, setTokenState] = useState(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(!!token);

  const setToken = (t, u) => {
    if (t) {
      localStorage.setItem(tokenKey, t);
      if (u) localStorage.setItem(userKey, JSON.stringify(u));
      setTokenState(t);
      setUser(u ?? null);
    } else {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      setTokenState(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => {
        setUser(u);
        localStorage.setItem(userKey, JSON.stringify(u));
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token]);

  const login = (userData, t) => setToken(t, userData);
  const logout = () => setToken(null);
  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem(userKey, JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
