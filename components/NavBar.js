import { useState, useEffect } from 'react';
import NotificationHistory from './NotificationHistory';

export default function NavBar({ isLoggedIn, user, onLogout, onLogin, onShowNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count periodically
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/history?limit=1', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.pagination.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Helper function to safely get balance
  const getBalance = () => {
    if (!user) return 0;
    // Handle case where balance is a MongoDB NumberInt
    return user.balance?.$numberInt || user.balance || 0;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <a href="/" 
           onClick={(e) => { e.preventDefault(); window.location.reload(); }}
           className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity group">
          <h1 className="text-xl sm:text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent font-black
              group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300">
              gpt
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-black
              group-hover:from-green-500 group-hover:to-emerald-400 transition-all duration-300">
              SILK
            </span>
          </h1>
          <div className="h-5 sm:h-7 w-px bg-gradient-to-b from-purple-200 to-emerald-200" />
          <p className="flex items-center text-[10px] sm:text-sm font-medium tracking-wide
            bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400 
            bg-clip-text text-transparent uppercase gap-1 sm:gap-2">
            <span className="text-base sm:text-xl">∞</span> 
            <span>infinite economy</span>
          </p>
        </a>

        {/* User Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notification Bell */}
            <button
              onClick={onShowNotifications}
              className="relative p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300
                hover:shadow-md active:shadow-sm active:translate-y-0.5 hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                  w-5 h-5 flex items-center justify-center rounded-full shadow-lg
                  border border-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile/Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-100/80 to-emerald-100/80 
                rounded-xl border border-emerald-200/50 shadow-md hover:shadow-lg transition-all duration-300 
                hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 
                flex items-center justify-center text-white text-sm sm:text-base font-bold group-hover:from-red-500 
                group-hover:to-pink-500 transition-all duration-300 shadow-sm">
                {user.username.toUpperCase()}
              </div>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            aria-label="Open authentication modal" 
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 
              text-white text-sm sm:text-base font-medium hover:shadow-xl hover:shadow-emerald-500/20
              active:shadow-md active:translate-y-0.5 transition-all duration-300 transform hover:-translate-y-1
              border border-emerald-300 backdrop-blur-sm flex items-center gap-2 sm:gap-3"
          >
            <span className="text-lg sm:text-xl">👋</span>
            <span>Login</span>
          </button>
        )}
      </div>

      {/* Notification History Modal */}
      <NotificationHistory 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
} 