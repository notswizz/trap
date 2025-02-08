import React, { useEffect, useRef } from 'react';
import ChatMessage from './messages';

export default function ChatMessages({ 
  messages, 
  isLoading, 
  error, 
  onActionConfirmation, 
  completedActions,
  lastMessageTimestamp 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, lastMessageTimestamp]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-gray-50 via-white to-gray-50/80">
      {messages.map((message, index) => {
        // Ensure action data is properly structured
        const enhancedMessage = {
          ...message,
          user: message.user || {
            username: message.analysis?.actionResult?.user?.username ||
                     message.analysis?.user?.username ||
                     message.userContext?.username
          },
          analysis: message.analysis ? {
            ...message.analysis,
            user: message.user || message.analysis.user || message.userContext,
            action: message.analysis.action ? {
              ...message.analysis.action,
              data: message.analysis.action.data || message.analysis.action,
              user: message.user || message.analysis.user || message.userContext
            } : null,
            actionResult: message.analysis.actionResult ? {
              ...message.analysis.actionResult,
              user: message.user || message.analysis.user || message.userContext
            } : null
          } : null
        };

        console.log('Enhanced message:', {
          user: enhancedMessage.user,
          analysisUser: enhancedMessage.analysis?.user,
          actionUser: enhancedMessage.analysis?.action?.user,
          resultUser: enhancedMessage.analysis?.actionResult?.user
        });

        return (
          <ChatMessage
            key={index}
            message={enhancedMessage}
            handleActionConfirmation={onActionConfirmation}
            completedActions={completedActions}
            isLoading={isLoading}
          />
        );
      })}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-purple-100/50 rounded-xl px-4 py-2 shadow-sm">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-pulse delay-150" />
              <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-pulse delay-300" />
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center">
          <div className="bg-white/90 text-red-500 rounded-xl px-4 py-2 text-sm border border-red-200/50 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} className="h-0" />
    </div>
  );
} 