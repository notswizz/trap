import React from 'react';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  console.log('Message props:', { 
    isWelcome: message.isWelcome,
    content: message.content,
    role: message.role 
  });

  const handleBuyClick = (listing) => {
    // Construct the buy message
    const buyMessage = `buy "${listing.title}" for ${listing.price} tokens`;
    // Find the chat input and populate it
    const chatInput = document.querySelector('input[type="text"]');
    if (chatInput) {
      chatInput.value = buyMessage;
      // Trigger input change event to update React state
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Focus the input
      chatInput.focus();
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
            : message.isWelcome
            ? 'bg-gradient-to-br from-white via-purple-50 to-emerald-50 border border-purple-100/50 shadow-lg'
            : 'bg-gradient-to-br from-white via-purple-50/30 to-emerald-50/30 border border-purple-100/50 shadow-md backdrop-blur-sm'
        }`}
      >
        <div className={`whitespace-pre-wrap text-sm sm:text-md leading-relaxed ${
          message.role === 'assistant' ? 'font-medium' : ''
        }`}>
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
                  <span>infinite AI economy</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
                  <span className="text-gray-500 text-xs sm:text-sm mr-1 hidden sm:inline">Tokens:</span>
                  <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                    {message.content.tokens.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  Ready to trade
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          ) : message.role === 'user' ? (
            <div className="text-white/90">
              {typeof message.content === 'string' ? message.content : message.content.text}
            </div>
          ) : message.role === 'assistant' ? (
            <>
              <div className="text-base sm:text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {typeof message.content === 'string' ? message.content : message.content.text}
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />

              {message.analysis?.action?.status === 'pending' && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg">
                      {message.analysis?.action?.type === 'createListing' ? '✨' : 
                       message.analysis?.action?.type === 'buyListing' ? '🛍️' : 
                       message.analysis?.action?.type === 'updateBalance' ? '💰' : '❓'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.analysis?.action?.type === 'createListing' ? 'Create New Listing' :
                         message.analysis?.action?.type === 'buyListing' ? 'Confirm Purchase' :
                         message.analysis?.action?.type === 'updateBalance' ? 'Update Balance' : 'Confirm Action'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {message.analysis?.action?.type === 'createListing' ? 
                          `Create listing "${message.analysis.action.data.title}" for ${message.analysis.action.data.price} tokens` :
                         message.analysis?.action?.type === 'buyListing' ?
                          `Purchase item for ${message.analysis.action.data.price} tokens` :
                         message.analysis?.action?.type === 'updateBalance' ?
                          `Add ${message.analysis.action.data.amount} tokens to your balance` :
                          'Please confirm this action'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleActionConfirmation(true, message.analysis.action, message.timestamp)}
                          disabled={completedActions.has(message.timestamp) || isLoading}
                          className={`group relative px-4 py-2 text-white text-sm font-medium rounded-lg
                          transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                          disabled:cursor-not-allowed ${
                            completedActions.has(message.timestamp) || isLoading
                              ? 'bg-gray-400/50 backdrop-blur-sm'
                              : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600'
                          }`}
                        >
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-green-500/20 blur-xl 
                            group-hover:from-emerald-500/30 group-hover:to-green-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                          <div className="relative flex items-center gap-1.5">
                            {completedActions.has(message.timestamp) ? (
                              <>
                                <span>✓</span>
                                <span>Confirmed</span>
                              </>
                            ) : (
                              <>
                                <span>✓</span>
                                <span>Confirm</span>
                              </>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => handleActionConfirmation(false, message.analysis.action, message.timestamp)}
                          disabled={completedActions.has(message.timestamp) || isLoading}
                          className={`group relative px-4 py-2 text-gray-700 text-sm font-medium rounded-lg
                          transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                          disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300
                          hover:from-gray-200 hover:to-gray-100`}
                        >
                          <div className="relative flex items-center gap-1.5">
                            {completedActions.has(message.timestamp) ? (
                              <>
                                <span>✕</span>
                                <span>Cancelled</span>
                              </>
                            ) : (
                              <>
                                <span>✕</span>
                                <span>Cancel</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                      {!completedActions.has(message.timestamp) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-2">
                          <div className="h-1 w-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse" />
                          Pending confirmation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : message.isAction && message.analysis?.action?.status === 'completed' ? (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400/10 to-green-500/10 border border-emerald-200 text-emerald-700">
                  Confirmed
                </div>
              </div>
              {message.analysis.action.type === 'updateBalance' ? (
                <div className="font-medium">
                  Balance updated from{' '}
                  <span className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {Number(message.analysis.actionResult.balance - message.analysis.action.data.amount).toLocaleString()}
                  </span>
                  {' '}to{' '}
                  <span className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {Number(message.analysis.actionResult.balance).toLocaleString()}
                  </span>
                  {' '}tokens
                </div>
              ) : message.analysis.action.type === 'fetchListings' ? (
                <div className="space-y-2">
                  {message.analysis.actionResult.listings?.length > 0 ? (
                    <div className="grid gap-3">
                      {message.analysis.actionResult.listings.map((listing, index) => (
                        <div key={index} className="group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                          {/* Listing Icon */}
                          <div className="absolute -left-2 -top-2 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg">
                            🏷️
                          </div>
                          
                          {/* Main Content */}
                          <div className="flex-1 ml-4">
                            <div className="font-semibold text-lg text-gray-900">{listing.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {listing.description || 'No description provided'}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                👤 <span className="font-medium">{listing.owner}</span>
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1">
                                🎨 <span className="font-medium">Created by {listing.creator}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Price Tag */}
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                              {Number(listing.price).toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-emerald-600">tokens</div>
                          </div>
                          
                          {/* Buy Button - Only show if the owner is different from current user */}
                          {listing.owner !== (message.user?.username) && (
                            <button 
                              onClick={() => handleBuyClick(listing)}
                              className="sm:self-stretch px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Buy Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                      <div className="text-4xl mb-3">🔍</div>
                      <div className="text-gray-600 font-medium text-center">
                        No listings found
                      </div>
                      <div className="text-sm text-gray-500 text-center mt-1">
                        Try adjusting your search or create a new listing
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        
        {(!message.isAction || !message.isPending) && (
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