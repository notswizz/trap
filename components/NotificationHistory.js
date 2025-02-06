import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function NotificationHistory({ isOpen, onClose }) {
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
      const res = await fetch('/api/notifications/clear', {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to clear notifications');

      // Refresh notifications after clearing
      await fetchNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4 sm:my-8 shadow-xl relative flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notification History</h2>
            {pagination.unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {pagination.unreadCount} unread notifications
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                disabled={clearing}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 
                  hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notification.type)} 
                      text-white flex items-center justify-center text-lg shadow-lg`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white sticky bottom-0">
            <button
              onClick={() => fetchNotifications(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchNotifications(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.pages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 