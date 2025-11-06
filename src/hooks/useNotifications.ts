import { useState, useCallback } from 'react';
import { NotificationData } from '../components/ui/notification-overlay';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      duration: 4000, // Default 4 seconds
      showCloseButton: true,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return showNotification({ type: 'success', title, message, duration });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return showNotification({ type: 'error', title, message, duration });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return showNotification({ type: 'warning', title, message, duration });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return showNotification({ type: 'info', title, message, duration });
  }, [showNotification]);

  // Persistent notifications (duration: 0)
  const showPersistentNotification = useCallback((notification: Omit<NotificationData, 'id' | 'duration'>) => {
    return showNotification({ ...notification, duration: 0 });
  }, [showNotification]);

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistentNotification
  };
}

// Confirmation dialog hook
export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    type?: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const showConfirmation = useCallback((options: {
    type?: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmation({
      isOpen: true,
      type: options.type || 'warning',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: () => {
        options.onConfirm();
        setConfirmation(null);
      },
      onCancel: () => {
        options.onCancel?.();
        setConfirmation(null);
      }
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  return {
    confirmation,
    showConfirmation,
    hideConfirmation
  };
}