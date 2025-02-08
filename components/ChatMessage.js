import React, { useState, useEffect } from 'react';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Debug log to see message structure
  console.log('ChatMessage received:', {
    isAction: message.isAction,
    type: message.analysis?.action?.type,
    executed: message.analysis?.actionExecuted,
    result: message.analysis?.actionResult
  });

  useEffect(() => {
    if (message.role === 'assistant' && !message.isWelcome) {
      setIsTyping(true);
      setDisplayedText('');
      let currentText = '';
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < (message.content?.text || message.content || '').length) {
          currentText += (message.content?.text || message.content || '')[index];
          setDisplayedText(currentText);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      setDisplayedText(message.content?.text || message.content || '');
    }
  }, [message.content, message.role, message.isWelcome]);

  const renderContent = () => {
    // Debug log for listing creation case
    if (message.isAction && message.analysis?.action?.type === 'createListing') {
      console.log('Rendering listing:', {
        listing: message.analysis?.actionResult?.listing,
        executed: message.analysis?.actionExecuted
      });
    }

    // Handle listing creation result
    if (message.isAction && 
        message.analysis?.action?.type === 'createListing' && 
        message.analysis?.actionExecuted && 
        message.analysis?.actionResult?.listing) {
      const listing = message.analysis.actionResult.listing;
      return (
        <div className="space-y-4">
          <div className="text-base sm:text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            ✨ Successfully created listing "{listing.title}" for {listing.price} tokens
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-emerald-50/30 
            border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300
            backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-emerald-500/5 to-indigo-500/5 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            
            <div className="space-y-4 relative">
              {/* Title and Price */}
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-base text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-600 
                  bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 
                  transition-all duration-300 truncate flex-1">{listing.title}</h3>
                <div className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-br from-emerald-50 to-green-50 
                  px-2.5 py-1 rounded-lg border border-emerald-200/50 shadow-sm group-hover:shadow-md 
                  transition-all duration-300 relative overflow-hidden">
                  <span className="text-base font-bold bg-gradient-to-r from-emerald-500 to-green-500 
                    bg-clip-text text-transparent relative z-10">
                    {Number(listing.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-600/70 font-medium relative z-10">tokens</span>
                </div>
              </div>

              {/* Add image display */}
              {listing.imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={listing.imageUrl} 
                    alt={`${listing.title} - ${listing.description}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {listing.imagePrompt && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <div className="text-white text-sm text-center">
                        {listing.imagePrompt}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>

              {/* Creator Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Created by {listing.creatorDisplayName || listing.creatorUsername}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle image messages
    if (message.isImage || 
        (message.analysis?.action?.type === 'generateImage' && message.analysis?.actionExecuted) ||
        (message.analysis?.actionResult?.isImage)) {
      return (
        <div className="space-y-3">
          <img 
            src={message.content || message.analysis?.actionResult?.content} 
            alt={message.prompt || message.analysis?.actionResult?.prompt || "Generated image"}
            className="w-full rounded-lg shadow-md"
          />
          {(message.prompt || message.analysis?.actionResult?.prompt) && (
            <div className="text-sm text-gray-500 italic">
              Prompt: {message.prompt || message.analysis?.actionResult?.prompt}
            </div>
          )}
        </div>
      );
    }

    // Handle regular messages
    return (
      <div className="prose dark:prose-invert max-w-none">
        {message.isWelcome ? (
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent font-black">
                  gpt
                </span>
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-black">
                  SILK
                </span>
              </div>
              <div className="flex items-center text-[10px] sm:text-xs font-medium tracking-wide
                bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400 
                bg-clip-text text-transparent uppercase gap-0.5 sm:gap-1">
                <span className="text-sm sm:text-base">∞</span> 
                <span>infinite economy</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
              Ready to trade
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
            </div>
          </div>
        ) : message.role === 'user' ? (
          <div>
            {message.content?.text || message.content}
          </div>
        ) : message.role === 'assistant' ? (
          <>
            <div className={`text-base sm:text-lg font-medium ${isTyping ? 'after:content-["▋"] after:ml-0.5 after:animate-blink after:text-purple-600' : ''}`}>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {displayedText}
              </span>
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />
          </>
        ) : null}
      </div>
    );
  };

  return (
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
          {renderContent()}
        </div>
        
        {(!message.isAction || !message.isPending) && !message.analysis?.action?.type?.includes('Listing') && (
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
        )}
      </div>
    </div>
  );
} 