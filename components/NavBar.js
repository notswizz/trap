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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 
      shadow-sm shadow-purple-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <a href="/" 
           onClick={(e) => { e.preventDefault(); window.location.reload(); }}
           className="flex items-center gap-3 sm:gap-4 hover:opacity-90 transition-all duration-500 group">
          <h1 className="text-xl sm:text-3xl font-bold relative">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent font-black
              group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500
              [background-size:200%] group-hover:[background-position:100%] [background-position:0%]">
              gpt
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-black
              group-hover:from-green-500 group-hover:to-emerald-400 transition-all duration-500
              [background-size:200%] group-hover:[background-position:100%] [background-position:0%]">
              SILK
            </span>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-emerald-500/0
              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"/>
          </h1>
          <div className="h-5 sm:h-7 w-px bg-gradient-to-b from-purple-200 via-emerald-200 to-purple-200 opacity-50" />
          <p className="flex items-center text-[10px] sm:text-sm font-medium tracking-wide
            bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400 
            bg-clip-text text-transparent uppercase gap-1 sm:gap-2
            group-hover:from-indigo-400 group-hover:via-purple-400 group-hover:to-emerald-400 transition-all duration-500">
            <span className="text-base sm:text-xl animate-pulse">∞</span> 
            <span>infinite economy</span>
          </p>
        </a>

        {/* User Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notification Bell */}
            <button
              onClick={onShowNotifications}
              className="relative p-2 sm:p-2.5 hover:bg-gray-50/80 rounded-xl transition-all duration-300
                hover:shadow-lg hover:shadow-purple-500/10 active:shadow-sm active:translate-y-0.5 hover:-translate-y-0.5
                border border-transparent hover:border-purple-100/50"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 transition-colors duration-300
                group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs 
                  w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-red-500/20
                  border border-white animate-bounce">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile/Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 
                bg-gradient-to-br from-purple-50 via-white to-emerald-50 
                rounded-xl border border-purple-200/30 shadow-md hover:shadow-xl hover:shadow-purple-500/10 
                transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 
                group-hover:from-red-500 group-hover:to-pink-500 transition-all duration-500
                flex items-center justify-center relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"/>
                <span className="text-white text-sm sm:text-base font-bold relative z-10">
                  {user.username.toUpperCase()}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            aria-label="Open authentication modal" 
            className="relative group px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl overflow-hidden
              transition-all duration-500 transform hover:-translate-y-1 active:translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 
              group-hover:from-emerald-500 group-hover:to-emerald-700 transition-all duration-500"/>
            <div className="absolute inset-[1px] bg-gradient-to-r from-emerald-400 to-emerald-600 
              group-hover:from-emerald-500 group-hover:to-emerald-700 transition-all duration-500 rounded-xl"/>
            <div className="relative flex items-center gap-2 sm:gap-3 text-white">
              <span className="text-lg sm:text-xl animate-bounce">👋</span>
              <span className="font-medium">Login</span>
            </div>
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