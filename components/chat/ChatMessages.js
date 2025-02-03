import React from 'react';
import ChatMessage from './ChatMessage';

export default function ChatMessages({ 
  messages, 
  isLoading, 
  error, 
  handleActionConfirmation, 
  completedActions 
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          handleActionConfirmation={handleActionConfirmation}
          completedActions={completedActions}
          isLoading={isLoading}
        />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 text-gray-800 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce delay-100" />
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 text-red-500 rounded-xl px-5 py-3 text-sm border border-red-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 