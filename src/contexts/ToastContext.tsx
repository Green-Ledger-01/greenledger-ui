import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { TOAST_CONFIG } from '../config/constants';

// Types
export interface AppToast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: AppToast['type'], duration?: number) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = useCallback((
    message: string, 
    type: AppToast['type'] = 'info', 
    duration: number = TOAST_CONFIG.DEFAULT_DURATION
  ) => {
    const id = Date.now() + Math.random(); // More unique ID
    const toastDuration = type === 'success' ? TOAST_CONFIG.SUCCESS_DURATION : 
                         type === 'error' ? TOAST_CONFIG.ERROR_DURATION : duration;
    
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration: toastDuration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => removeToast(toast.id), toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const getToastIcon = (type: AppToast['type']) => {
    const iconProps = { className: "h-5 w-5 mr-3 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'p-4 rounded-lg shadow-lg flex items-start transition-all duration-300 ease-out transform',
              'animate-in slide-in-from-right-full',
              {
                'bg-green-50 border border-green-200 text-green-800': toast.type === 'success',
                'bg-red-50 border border-red-200 text-red-800': toast.type === 'error',
                'bg-yellow-50 border border-yellow-200 text-yellow-800': toast.type === 'warning',
                'bg-blue-50 border border-blue-200 text-blue-800': toast.type === 'info',
              }
            )}
          >
            {getToastIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Close notification"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};