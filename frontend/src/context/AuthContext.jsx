import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    const saved = localStorage.getItem('sb_user');
    if (token && saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setLoading(false);

        // Verify token in background
        authAPI.me()
          .then(res => {
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem('sb_user', JSON.stringify(res.data.user));
            }
          })
          .catch(err => {
            if (err.response?.status === 401) {
              logout();
            }
          });
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('sb_token', token);
    localStorage.setItem('sb_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
