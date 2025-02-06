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
    <div className="p-2 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between 
      sm:items-center gap-2 sm:gap-0 bg-gradient-to-r from-indigo-50 to-purple-50">
      {/* Stats container - now scrollable on mobile */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 
        scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="flex-shrink-0 flex items-center px-2 sm:px-3 py-1 sm:py-1.5 
          border-2 border-purple-400 rounded-full">
          <span className="text-base sm:text-lg mr-1 sm:mr-2">🌎</span>
          <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 
            to-pink-600 bg-clip-text text-transparent">
            {stats.totalListings}
          </span>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 
            border-2 border-blue-400 rounded-full">
            <span className="text-base sm:text-lg mr-1 sm:mr-2">🎒</span>
            <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 
              to-cyan-500 bg-clip-text text-transparent">
              {stats.userListings}
            </span>
          </div>
          <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 
            border-2 border-emerald-400 rounded-full">
            <span className="text-base sm:text-lg mr-1 sm:mr-2">🪙</span>
            <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 
              to-green-500 bg-clip-text text-transparent">
              {Number(stats.tokens).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 via-pink-600 
          to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 
          transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 
          shadow-md text-xs sm:text-base transform hover:-translate-y-0.5 active:translate-y-0
          w-full sm:w-auto"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Chat</span>
      </button>
    </div>
  );
} 