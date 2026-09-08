import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * AuthContext — Global authentication state.
 *
 * React Context explained:
 * - createContext() creates a "global store" any component can read
 * - useContext(AuthContext) lets any component access user/token without prop drilling
 * - The Provider wraps the whole app so all children can access the context
 *
 * What this stores:
 * - user: { id, name, email, role }
 * - token: JWT string
 * - isLoading: true while checking if user is already logged in
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check if a token exists and fetch the current user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('campusiq_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data.data.user);
      } catch {
        // Token invalid or expired — clear storage
        localStorage.removeItem('campusiq_token');
        localStorage.removeItem('campusiq_user');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('campusiq_token', token);
    localStorage.setItem('campusiq_user', JSON.stringify(user));
    setUser(user);
    return user; // caller uses role to redirect
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authService.register(formData);
    const { token, user } = res.data.data;
    localStorage.setItem('campusiq_token', token);
    localStorage.setItem('campusiq_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('campusiq_token');
    localStorage.removeItem('campusiq_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — cleaner than writing useContext(AuthContext) everywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
