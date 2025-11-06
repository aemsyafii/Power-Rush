import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from './button';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // in ms, 0 for persistent
  showCloseButton?: boolean;
}

interface NotificationOverlayProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
}

const getNotificationIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    case 'error':
      return <XCircle className="w-6 h-6 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    case 'info':
      return <Info className="w-6 h-6 text-blue-600" />;
  }
};

const getNotificationColors = (type: NotificationData['type']) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-800',
        message: 'text-green-700'
      };
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'text-red-800',
        message: 'text-red-700'
      };
    case 'warning':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        title: 'text-orange-800',
        message: 'text-orange-700'
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        title: 'text-blue-800',
        message: 'text-blue-700'
      };
  }
};

export function NotificationOverlay({ notifications, onDismiss }: NotificationOverlayProps) {
  // Auto-dismiss notifications with duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop for persistent notifications */}
      <AnimatePresence>
        {notifications.some(n => n.duration === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            onClick={(e) => {
              // Allow clicking backdrop to dismiss persistent notifications
              const persistentNotifications = notifications.filter(n => n.duration === 0);
              persistentNotifications.forEach(n => onDismiss(n.id));
            }}
          />
        )}
      </AnimatePresence>

      {/* Notifications Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => {
              const colors = getNotificationColors(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    mass: 0.8
                  }}
                  className={`
                    pointer-events-auto
                    ${colors.bg} ${colors.border}
                    border-2 rounded-lg shadow-xl
                    p-6 relative
                    max-w-md w-full
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-2 ${colors.title}`}>
                        {notification.title}
                      </h3>
                      <p className={`${colors.message} leading-relaxed`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Close Button */}
                    {(notification.showCloseButton !== false) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/50 -mt-1 -mr-1"
                        onClick={() => onDismiss(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Progress bar for timed notifications */}
                  {notification.duration && notification.duration > 0 && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ 
                        duration: notification.duration / 1000,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  isOpen: boolean;
  type?: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  type = 'warning',
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getDialogColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          confirmButton: 'bg-red-600 hover:bg-red-700',
          icon: <XCircle className="w-6 h-6 text-red-600" />
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          title: 'text-orange-800',
          message: 'text-orange-700',
          confirmButton: 'bg-orange-600 hover:bg-orange-700',
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
          icon: <Info className="w-6 h-6 text-blue-600" />
        };
    }
  };

  const colors = getDialogColors();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
        className={`
          relative z-10 w-full max-w-md
          ${colors.bg} ${colors.border}
          border-2 rounded-lg shadow-xl p-6
        `}
      >
        <div className="flex items-start gap-4 mb-6">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {colors.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className={`font-semibold text-lg mb-2 ${colors.title}`}>
              {title}
            </h3>
            <p className={`${colors.message} leading-relaxed`}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`text-white ${colors.confirmButton}`}
          >
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}