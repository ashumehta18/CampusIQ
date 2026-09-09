import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * AuthContext — Global authentication state.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safely extract user and token payload from backend responses
  const extractAuthData = (res) => {
    // Handles both res.data.data (standard) and res.data direct responses
    const payload = res?.data?.data || res?.data || {};
    return {
      token: payload.token,
      user: payload.user,
    };
  };

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
        const { user: fetchedUser } = extractAuthData(res);
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          throw new Error('User data not found in response');
        }
      } catch (err) {
        // Token invalid or expired — clear storage
        localStorage.removeItem('campusiq_token');
        localStorage.removeItem('campusiq_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user: loggedInUser } = extractAuthData(res);

    if (token && loggedInUser) {
      localStorage.setItem('campusiq_token', token);
      localStorage.setItem('campusiq_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser; // caller uses role to redirect
    } else {
      throw new Error('Invalid authentication response structure');
    }
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authService.register(formData);
    const { token, user: registeredUser } = extractAuthData(res);

    if (token && registeredUser) {
      localStorage.setItem('campusiq_token', token);
      localStorage.setItem('campusiq_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    } else {
      throw new Error('Invalid registration response structure');
    }
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