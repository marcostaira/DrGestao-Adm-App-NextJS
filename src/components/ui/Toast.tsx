'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[type];

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 transform',
        toastStyles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          {title && (
            <p className="text-sm font-medium">{title}</p>
          )}
          <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, title?: string) => {
    addToast({ type: 'success', message, title });
  };

  const error = (message: string, title?: string) => {
    addToast({ type: 'error', message, title });
  };

  const warning = (message: string, title?: string) => {
    addToast({ type: 'warning', message, title });
  };

  const info = (message: string, title?: string) => {
    addToast({ type: 'info', message, title });
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );

  return {
    success,
    error,
    warning,
    info,
    ToastContainer
  };
}