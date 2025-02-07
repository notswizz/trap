import React, { useState, useEffect } from 'react';

export default function ChatHeader({ onNewChat, statsUpdateTrigger, onStatClick, isLoading, error: chatError }) {
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

  useEffect(() => {
    fetchStats();
  }, [statsUpdateTrigger]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatClick = (message) => {
    if (onStatClick) {
      onStatClick(message);
    }
  };

  return (
    <div className="relative px-3 py-2 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="flex flex-col space-y-2">
        {/* New Chat button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
            text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 
            transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>

        {/* Stats row */}
        <div className="flex justify-between items-center px-1">
          <div className="grid grid-cols-3 gap-1 w-full">
            {/* Global Listings */}
            <button
              onClick={() => handleStatClick("Show me all available listings")}
              className="flex items-center justify-center space-x-1.5 p-1.5 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50
                hover:from-purple-100 hover:to-pink-100 transition-colors duration-200 active:scale-95"
            >
              <span className="text-base">🌎</span>
              <span className="text-xs font-semibold text-purple-700">{stats.totalListings}</span>
            </button>

            {/* Tokens - Now in the middle */}
            <button
              onClick={() => handleStatClick("What is my current token balance?")}
              className="flex items-center justify-center space-x-1.5 p-1.5 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50
                hover:from-emerald-100 hover:to-green-100 transition-colors duration-200 active:scale-95"
            >
              <span className="text-base">🪙</span>
              <span className="text-xs font-semibold text-emerald-700">
                {Number(stats.tokens).toLocaleString()}
              </span>
            </button>

            {/* User Listings */}
            <button
              onClick={() => handleStatClick("Show me my listings")}
              className="flex items-center justify-center space-x-1.5 p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50
                hover:from-blue-100 hover:to-cyan-100 transition-colors duration-200 active:scale-95"
            >
              <span className="text-base">🎒</span>
              <span className="text-xs font-semibold text-blue-700">{stats.userListings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 