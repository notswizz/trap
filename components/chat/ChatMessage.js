import React from 'react';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
            : message.isAction
            ? message.isPending
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-800 rounded-none border border-amber-200 shadow-md'
              : 'bg-gradient-to-r from-emerald-50 to-green-50 text-green-800 rounded-none border border-green-200 shadow-md'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-md'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm sm:text-md leading-relaxed">{message.content}</div>
        
        {message.isAction && message.isPending && (
          <div className="mt-2 sm:mt-3 flex gap-2">
            <button
              onClick={() => handleActionConfirmation(true, message.analysis.action, message.timestamp)}
              disabled={completedActions.has(message.timestamp) || isLoading}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-medium rounded-full
              transition-all duration-200 ${
                completedActions.has(message.timestamp) || isLoading
                  ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-md hover:from-emerald-600 hover:to-green-600'
              }`}
            >
              {completedActions.has(message.timestamp) ? '✓ Confirmed' : 'Confirm'}
            </button>
            <button
              onClick={() => handleActionConfirmation(false, message.analysis.action, message.timestamp)}
              disabled={completedActions.has(message.timestamp) || isLoading}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-medium rounded-full
              transition-all duration-200 ${
                completedActions.has(message.timestamp) || isLoading
                  ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-md hover:from-rose-600 hover:to-red-600'
              }`}
            >
              {completedActions.has(message.timestamp) ? '✗ Cancelled' : 'Cancel'}
            </button>
          </div>
        )}

        <div className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 flex items-center gap-1.5 ${
          message.role === 'user' 
            ? 'text-indigo-200' 
            : message.isAction 
            ? message.isPending
              ? 'text-amber-600'
              : 'text-green-600'
            : 'text-gray-400'
        }`}>
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
          </svg>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 