import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();
const MAX_NOTIFICATIONS = 50;

const getStorageKey = (userId) => `expense_notifications_${userId}`;

const loadNotifications = (userId) => {
  if (!userId) return [];

  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
};

const saveNotifications = (userId, notifications) => {
  if (!userId) return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
};

const createNotificationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const NotificationsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }

    setNotifications(loadNotifications(user.id));
  }, [isAuthenticated, user?.id]);

  const persist = useCallback((updater) => {
    if (!user?.id) return;

    setNotifications((current) => {
      const next = updater(current);
      saveNotifications(user.id, next);
      return next;
    });
  }, [user?.id]);

  const addNotification = useCallback((notification) => {
    if (!user?.id) return;

    persist((current) => {
      if (notification.dedupeKey && current.some((item) => item.dedupeKey === notification.dedupeKey)) {
        return current;
      }

      const next = [
        {
          id: createNotificationId(),
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          read: false,
          createdAt: notification.createdAt || new Date().toISOString(),
          dedupeKey: notification.dedupeKey || null
        },
        ...current
      ].slice(0, MAX_NOTIFICATIONS);

      return next;
    });
  }, [persist, user?.id]);

  const markAsRead = useCallback((id) => {
    persist((current) => current.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )));
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    persist((current) => current.map((item) => ({ ...item, read: true })));
  }, [persist]);

  useEffect(() => {
    if (!user?.id) return;

    addNotification({
      title: 'Support is available',
      message: 'Use Contact Us any time if you need help with budgets, categories, exports, or your account.',
      type: 'info',
      dedupeKey: `support-message-${user.id}`
    });

    const sessionKey = `login-notice-${user.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      addNotification({
        title: 'Signed in successfully',
        message: `Welcome back, ${user.name || 'User'}.`,
        type: 'success',
        dedupeKey: `login-session-${user.id}-${new Date().toISOString().slice(0, 10)}`
      });
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [addNotification, user?.id, user?.name]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
