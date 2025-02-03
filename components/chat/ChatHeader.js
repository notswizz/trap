import React from 'react';

export default function ChatHeader({ onNewChat }) {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Chat</h2>
      <button
        onClick={onNewChat}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
        hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 
        flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Chat</span>
      </button>
    </div>
  );
} 