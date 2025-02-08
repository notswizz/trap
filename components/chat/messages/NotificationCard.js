import React from 'react';

export default function NotificationCard({ notification }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LISTING_SOLD':
        return '💰';
      case 'LISTING_PURCHASED':
        return '🛍️';
      default:
        return '💎';
    }
  };

  const getNotificationGradient = (type) => {
    switch (type) {
      case 'LISTING_SOLD':
        return 'from-emerald-500 to-green-500';
      case 'LISTING_PURCHASED':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case 'LISTING_SOLD':
        return 'Sale';
      case 'LISTING_PURCHASED':
        return 'Purchase';
      default:
        return 'Balance Update';
    }
  };

  return (
    <div 
      className="group relative flex-none w-[300px] p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1
        bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md hover:shadow-lg"
    >
      <div className={`absolute -right-1 top-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg
        bg-gradient-to-r ${getNotificationGradient(notification.type)} text-white`}
      >
        {getNotificationLabel(notification.type)}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full 
            bg-gradient-to-r ${getNotificationGradient(notification.type)}
            text-white flex items-center justify-center text-lg shadow-lg`}
          >
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
            {notification.data?.amount > 0 && (
              <p className="text-xs font-medium text-emerald-600 mt-1">
                {notification.data.amount} tokens
              </p>
            )}
            {notification.data?.newBalance > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                New balance: {notification.data.newBalance} tokens
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 