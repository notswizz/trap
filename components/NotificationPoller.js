import { useEffect, useContext, useRef } from 'react';
import { ToastContext } from './Toaster';

export default function NotificationPoller() {
  const { showToast } = useContext(ToastContext);
  const lastCheckedRef = useRef(Date.now());

  const checkNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?lastChecked=${lastCheckedRef.current}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const { notifications } = await res.json();
      
      // Update last checked timestamp
      lastCheckedRef.current = Date.now();

      // Show notifications as toasts
      notifications.forEach(notification => {
        let type = 'info';
        
        switch (notification.type) {
          case 'LISTING_SOLD':
            type = 'success';
            break;
          case 'LISTING_PURCHASED':
            type = 'success';
            break;
          case 'BALANCE_UPDATE':
            type = 'info';
            break;
          default:
            type = 'info';
        }

        showToast({
          message: notification.message,
          type,
          duration: 8000 // Show for 8 seconds
        });
      });

    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkNotifications();

    // Then check every 30 seconds
    const interval = setInterval(checkNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything
  return null;
} 