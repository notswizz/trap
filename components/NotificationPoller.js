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
        let duration = 5000; // Default duration
        
        switch (notification.type) {
          case 'LISTING_SOLD':
            type = 'success';
            duration = 8000; // Important transactions show longer
            break;
          case 'LISTING_PURCHASED':
            type = 'success';
            duration = 8000;
            break;
          case 'LISTING_CREATED':
            type = 'success';
            duration = 6000;
            break;
          case 'BALANCE_UPDATE':
            type = notification.data.amount > 0 ? 'success' : 'warning';
            duration = 6000;
            break;
          default:
            type = 'info';
            duration = 5000;
        }

        showToast({
          message: notification.message,
          type,
          duration
        });
      });

    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkNotifications();

    // Then check every 15 seconds (reduced from 30 for more responsive notifications)
    const interval = setInterval(checkNotifications, 15000);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything
  return null;
} 