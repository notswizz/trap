import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function NotificationHistory({ isOpen, onClose, onClear }) {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    unreadCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/history?page=${page}&limit=20`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to fetch notifications');

      const data = await res.json();
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = async () => {
    try {
      setClearing(true);
      
      // Call parent's clear function which handles the API call
      if (typeof onClear === 'function') {
        await onClear();
      }

      // Reset local state
      setNotifications([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        pages: 1,
        currentPage: 1,
        unreadCount: 0
      }));

      // Wait a moment before closing to ensure state updates are processed
      setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }, 500);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Refresh notifications if clearing fails
      await fetchNotifications();
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Add effect to refetch when unread count changes
  useEffect(() => {
    if (isOpen && pagination.unreadCount > 0) {
      fetchNotifications();
    }
  }, [isOpen, pagination.unreadCount]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LISTING_SOLD':
        return '💰';
      case 'LISTING_PURCHASED':
        return '🛍️';
      case 'LISTING_CREATED':
        return '✨';
      case 'BALANCE_UPDATE':
        return '💎';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'LISTING_SOLD':
      case 'LISTING_PURCHASED':
        return 'bg-gradient-to-r from-emerald-500 to-green-500';
      case 'LISTING_CREATED':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'BALANCE_UPDATE':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl my-4 sm:my-8 shadow-2xl relative flex flex-col max-h-[85vh] sm:max-h-[90vh] border border-white/20 animate-slideIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky top-0 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Notifications
            </h2>
            {pagination.unreadCount > 0 && (
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                {pagination.unreadCount} unread {pagination.unreadCount === 1 ? 'notification' : 'notifications'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                disabled={clearing}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 
                  hover:bg-red-50 rounded-full transition-all duration-300 disabled:opacity-50
                  border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
              >
                {clearing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </span>
                ) : (
                  'Clear All'
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-90
                border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 min-h-0 px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-400 border-t-transparent shadow-lg"></div>
              <p className="text-gray-500 font-medium animate-pulse">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100/50 py-2">
              {notifications.map((notification, index) => (
                <div 
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50/50 transition-all duration-300 rounded-2xl my-2
                    ${!notification.read ? 'bg-indigo-50/50 hover:bg-indigo-50/70' : ''}
                    animate-fadeIn`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${getNotificationColor(notification.type)} 
                      text-white flex items-center justify-center text-xl shadow-lg
                      border border-white/20 backdrop-blur-sm transform hover:scale-110 transition-transform duration-300`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">We'll notify you when something important happens!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky bottom-0 rounded-b-3xl">
            <button
              onClick={() => fetchNotifications(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                hover:shadow-md disabled:hover:shadow-none"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchNotifications(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                hover:shadow-md disabled:hover:shadow-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 