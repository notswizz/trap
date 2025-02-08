import React, { useState, useEffect } from 'react';
import MessageContent from './MessageContent';
import MessageTimestamp from './MessageTimestamp';
import { animations } from './animations';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageContent = typeof message.content === 'string' 
    ? message.content 
    : message.content?.text || '';

  // Handle typing animation for assistant messages
  useEffect(() => {
    if (message.role === 'assistant' && !message.isWelcome) {
      setIsTyping(true);
      setDisplayedText('');
      let currentText = '';
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < messageContent.length) {
          currentText += messageContent[index];
          setDisplayedText(currentText);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 30); // Slightly slower for better readability

      return () => clearInterval(interval);
    } else {
      setDisplayedText(messageContent);
    }
  }, [messageContent, message.role, message.isWelcome]);

  // Handle buy click for listings
  const handleBuyClick = (listing) => {
    // Construct the buy message
    const buyMessage = `buy "${listing.title}" for ${listing.price} tokens`;
    // Find the chat input and populate it
    const chatInput = document.querySelector('input.chat-input');
    if (chatInput) {
      // Update the input value
      chatInput.value = buyMessage;
      // Create and dispatch an input event
      const inputEvent = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(inputEvent);
      // Focus the input
      chatInput.focus();
      // Trigger a keydown event for Enter
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      chatInput.dispatchEvent(enterEvent);
    }
  };

  return (
    <>
      <style jsx global>{animations}</style>
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        <div
          className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white rounded-br-none shadow-sm'
              : message.isWelcome
              ? 'bg-gradient-to-br from-white via-purple-50 to-emerald-50 border border-purple-100/50 shadow-lg'
              : 'relative bg-white/95 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden'
          }`}
        >
          {message.role === 'assistant' && !message.isWelcome && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-emerald-50/50 opacity-40" />
              <div className="absolute inset-0 border border-purple-200/30 rounded-xl sm:rounded-2xl animate-border-glow" />
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-200/20 via-emerald-200/20 to-indigo-200/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
          
          <div className={`relative whitespace-pre-wrap text-sm sm:text-md leading-relaxed ${
            message.role === 'user' 
              ? 'text-white' 
              : 'text-gray-800'
          }`}>
            <MessageContent 
              message={message}
              displayedText={displayedText}
              isTyping={isTyping}
              handleActionConfirmation={handleActionConfirmation}
              completedActions={completedActions}
              isLoading={isLoading}
              handleBuyClick={handleBuyClick}
            />
          </div>
          
          <MessageTimestamp message={message} />
        </div>
      </div>
    </>
  );
} 