import React from 'react';

export default function MessageTimestamp({ message }) {
  if (message.isAction && message.isPending) return null;
  if (message.analysis?.action?.type?.includes('Listing')) return null;

  return (
    <div className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 flex items-center gap-1.5 ${
      message.role === 'user' 
        ? 'text-indigo-200' 
        : message.isAction 
        ? message.analysis?.action?.status === 'completed'
          ? 'text-green-600'
          : 'text-gray-400'
        : 'text-gray-400'
    }`}>
      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
      </svg>
      {new Date(message.timestamp).toLocaleTimeString()}
    </div>
  );
} 