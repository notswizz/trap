import React, { useState, useEffect } from 'react';

export default function ChatHeader({ onNewChat, onMessageSent }) {
  const [stats, setStats] = useState({
    totalListings: '...',
    userListings: '...',
    responseTime: '...'
  });
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...'); // Debug log
      const res = await fetch('/api/listings/stats', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Received stats:', data); // Debug log
      
      setStats(prev => ({
        ...prev,
        totalListings: data.totalListings,
        userListings: data.userListings,
        responseTime: data.responseTime
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
    }
  };

  // Fetch stats on mount and when messages are sent
  useEffect(() => {
    console.log('Stats effect triggered', { onMessageSent }); // Debug log
    fetchStats();
  }, [onMessageSent]);

  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center px-3 py-1.5 border-2 border-emerald-400 rounded-full">
          <span className="text-lg sm:text-xl mr-2">
            {error ? '❌' : '⚡️'}
          </span>
          <span className="text-sm text-emerald-600 font-medium">
            {error ? 'Error loading stats' : 'System Active'}
          </span>
        </div>
        
        <div className="flex items-center px-3 py-1.5 border-2 border-purple-400 rounded-full">
          <span className="text-sm text-purple-600 font-medium mr-2">Global Listings</span>
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.totalListings}
          </span>
        </div>
        
        <div className="flex items-center px-3 py-1.5 border-2 border-blue-400 rounded-full">
          <span className="text-sm text-blue-600 font-medium mr-2">My Listings</span>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            {stats.userListings}
          </span>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-xl
        hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 
        flex items-center space-x-1 sm:space-x-2 shadow-md text-sm sm:text-base
        transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Chat</span>
      </button>
    </div>
  );
} 