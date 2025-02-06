import React, { useState, useEffect } from 'react';

export default function ChatHeader({ onNewChat, statsUpdateTrigger, isLoading, error: chatError }) {
  const [stats, setStats] = useState({
    totalListings: '...',
    userListings: '...',
    tokens: '...',
    username: '...'
  });
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/listings/stats', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      
      const data = await res.json();
      
      setStats(prev => ({
        ...prev,
        totalListings: data.totalListings,
        userListings: data.userListings,
        tokens: data.tokens,
        username: data.username
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
    }
  };

  // Fetch stats when statsUpdateTrigger changes
  useEffect(() => {
    fetchStats();
  }, [statsUpdateTrigger]);

  // Also fetch stats periodically every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-3 py-3 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50/50 to-pink-50">
      {/* Stats container */}
      <div className="flex items-center justify-between gap-3 sm:gap-5">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-1 sm:pb-0 
          scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {/* Global Stats */}
          <div className="flex-shrink-0 flex items-center px-3 sm:px-4 py-2 sm:py-2.5 
            bg-white/50 backdrop-blur-sm border-2 border-purple-400/50 rounded-2xl
            hover:border-purple-500 hover:shadow-md transition-all duration-300
            group">
            <span className="text-lg sm:text-xl mr-2 sm:mr-3 group-hover:scale-110 transition-transform">🌎</span>
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 
              to-pink-600 bg-clip-text text-transparent">
              {stats.totalListings}
            </span>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-3 sm:gap-5">
            {/* User Listings */}
            <div className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 
              bg-white/50 backdrop-blur-sm border-2 border-blue-400/50 rounded-2xl
              hover:border-blue-500 hover:shadow-md transition-all duration-300
              group">
              <span className="text-lg sm:text-xl mr-2 sm:mr-3 group-hover:scale-110 transition-transform">🎒</span>
              <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-500 
                to-cyan-500 bg-clip-text text-transparent">
                {stats.userListings}
              </span>
            </div>
            {/* Tokens */}
            <div className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 
              bg-white/50 backdrop-blur-sm border-2 border-emerald-400/50 rounded-2xl
              hover:border-emerald-500 hover:shadow-md transition-all duration-300
              group">
              <span className="text-lg sm:text-xl mr-2 sm:mr-3 group-hover:scale-110 transition-transform">🪙</span>
              <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-500 
                to-green-500 bg-clip-text text-transparent">
                {Number(stats.tokens).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex-shrink-0 px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 
            to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 
            transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3
            shadow-md text-sm sm:text-base transform hover:-translate-y-0.5 active:translate-y-0
            border border-white/20 backdrop-blur-sm min-w-[120px] sm:min-w-[140px]"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>
    </div>
  );
} 