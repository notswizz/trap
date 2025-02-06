import React, { useState, useEffect } from 'react';

export const ToastContext = React.createContext({
  showToast: () => {},
  hideToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-progress-bar {
          animation: shrink var(--duration) linear forwards;
        }
      `}</style>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default:
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match transition duration
  };

  return (
    <div className={`transform transition-all duration-300 ease-in-out
      ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg 
        ${getTypeStyles()} relative overflow-hidden group`}>
        {/* Progress bar */}
        {toast.duration !== Infinity && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
            <div 
              className="h-full bg-white/40 toast-progress-bar"
              style={{ '--duration': `${toast.duration}ms` }}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-sm font-medium pr-6">
          {toast.message}
        </p>
        
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute right-2 top-2 p-1 rounded-full 
            hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 