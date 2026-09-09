import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

/**
 * NotificationContext — tracks unread notification count globally.
 * Used by the sidebar to show a badge on the Notifications nav item.
 * Polling every 60 seconds keeps the count fresh without websockets.
 */
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch {
      // Silently fail — count badge is non-critical
    }
  }, [user]);

  // Fetch on mount and whenever user changes
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Poll every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [user, fetchCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refetchCount: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used inside NotificationProvider');
  return context;
};
