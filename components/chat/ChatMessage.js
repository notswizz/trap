import React, { useState, useEffect } from 'react';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [ownerFilter, setOwnerFilter] = React.useState('global');
  const [creationFilter, setCreationFilter] = React.useState('global');
  const listings = message.analysis?.actionResult?.listings || [];
  const filteredListings = message.analysis?.action?.type === 'fetchListings'
    ? listings.filter(listing => {
         let matches = true;
         if (searchTerm) {
           matches = matches && listing.title.toLowerCase().includes(searchTerm.toLowerCase());
         }
         if (ownerFilter === 'my' && message.user?.username) {
           console.log('Filtering by owner:', {
             listingOwner: listing.currentOwnerUsername,
             user: message.user.username,
             matches: listing.currentOwnerUsername?.toLowerCase() === message.user.username.toLowerCase()
           });
           matches = matches && listing.currentOwnerUsername?.toLowerCase() === message.user.username.toLowerCase();
         }
         if (creationFilter === 'my' && message.user?.username) {
           console.log('Filtering by creator:', {
             listingCreator: listing.creatorUsername,
             user: message.user.username,
             matches: listing.creatorUsername?.toLowerCase() === message.user.username.toLowerCase()
           });
           matches = matches && listing.creatorUsername?.toLowerCase() === message.user.username.toLowerCase();
         }
         return matches;
       })
    : [];

  console.log('Message props:', { 
    isWelcome: message.isWelcome,
    content: message.content,
    role: message.role,
    user: message.user,
    listings: listings.length,
    filtered: filteredListings.length
  });

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

  const handleBuyClick = (listing) => {
    // Construct the buy message
    const buyMessage = `buy "${listing.title}" for ${listing.price} tokens`;
    // Find the chat input and populate it
    const chatInput = document.querySelector('.chat-input');
    if (chatInput) {
      // Update the input value
      chatInput.value = buyMessage;
      // Create and dispatch an input event
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      Object.defineProperty(inputEvent, 'target', { value: chatInput, enumerable: true });
      chatInput.dispatchEvent(inputEvent);
      // Focus the input
      chatInput.focus();
    }
  };

  const formatActionMessage = (action) => {
    if (!action) return null;

    switch (action.type) {
      case 'fetchListings':
        const { listings, type, query } = action.data;
        if (!listings || listings.length === 0) {
          if (type === 'search') {
            return `No listings found matching "${query}"`;
          }
          return 'No listings found';
        }

        if (type === 'search') {
          const listing = listings[0]; // For search we only show one result
          return (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-white/90 via-purple-50/30 to-emerald-50/30 
                border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-500
                backdrop-blur-sm group relative overflow-hidden hover:-translate-y-2">
                
                {/* Image Container */}
                {listing.imageUrl && (
                  <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                    <img 
                      src={listing.imageUrl} 
                      alt={listing.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {listing.imagePrompt && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                        <div className="w-full backdrop-blur-sm bg-black/30 p-3">
                          <p className="text-xs text-white/90 line-clamp-2 font-medium">{listing.imagePrompt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Container */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-xl text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-600 
                        bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 
                        transition-all duration-300 flex-1">{listing.title}</h3>
                      <div className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-br from-emerald-50 to-green-50 
                        px-3 py-1.5 rounded-lg border border-emerald-200/50 shadow-sm group-hover:shadow-md 
                        transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 
                          opacity-0 group-hover:opacity-100 transition-all duration-300"/>
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-sm bg-gradient-to-r from-emerald-600 to-green-600 
                          bg-clip-text text-transparent relative z-10">{listing.currentOwnerDisplayName || listing.currentOwnerUsername}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
                  </div>

                  <button 
                    onClick={() => handleBuyClick(listing)}
                    className="group/btn relative w-full px-6 py-4 rounded-xl overflow-hidden
                      bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 
                      hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700
                      text-white font-semibold shadow-lg shadow-emerald-500/20
                      hover:shadow-xl hover:shadow-emerald-500/30 
                      transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                  >
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg_180deg,white/10_180deg_360deg)]
                      group-hover/btn:bg-[conic-gradient(from_180deg,transparent_0deg_180deg,white/20_180deg_360deg)]
                      animate-[spin_4s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <span className="flex items-center gap-2 text-lg">
                        <span>Buy Now</span>
                        <span className="text-2xl">⚡️</span>
                      </span>
                      <span className="flex items-center gap-2 pl-3 ml-3 border-l border-white/20">
                        <span className="text-2xl font-bold">
                          {Number(listing.price).toLocaleString()}
                        </span>
                        <span className="text-base opacity-90">tokens</span>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // For other listing types, show multiple results
        return (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing, index) => {
              const isOwnedByUser = listing.currentOwnerUsername === message.user?.username;
              return (
                <div key={index} 
                     className={`group relative flex-none w-[300px] rounded-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                       isOwnedByUser 
                         ? 'bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-purple-50/80 border-2 border-purple-200/50 shadow-lg hover:shadow-purple-200/25' 
                         : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 shadow-md hover:shadow-xl'
                     }`}>
                  
                  {/* Image Container - Moved to top with no padding */}
                  {listing.imageUrl && (
                    <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                      <img 
                        src={listing.imageUrl} 
                        alt={listing.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {listing.imagePrompt && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                          <div className="w-full backdrop-blur-sm bg-black/30 p-3">
                            <p className="text-xs text-white/90 line-clamp-2 font-medium">{listing.imagePrompt}</p>
                          </div>
                        </div>
                      )}
                      {/* Listing Badge - Moved inside image */}
                      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg
                        backdrop-blur-md transition-all duration-300 border ${
                        isOwnedByUser 
                          ? 'bg-purple-500/70 border-purple-300/30 text-white group-hover:bg-purple-500/90' 
                          : 'bg-emerald-500/70 border-emerald-300/30 text-white group-hover:bg-emerald-500/90'
                      }`}>
                        {isOwnedByUser ? 'My Listing' : 'Available'}
                      </div>
                    </div>
                  )}
                  
                  {/* Content Container */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-600/90 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                        {listing.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Owner & Creator Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-gray-100/80 group-hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors duration-300">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">{listing.currentOwnerDisplayName || listing.currentOwnerUsername}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100/80 group-hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors duration-300">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">Created by {listing.creatorDisplayName || listing.creatorUsername}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2">
                      {!isOwnedByUser ? (
                        <button 
                          onClick={() => handleBuyClick(listing)}
                          className="group/btn relative w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold 
                                   hover:from-emerald-600 hover:to-green-600 transform transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-emerald-200/50"
                        >
                          <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>Buy Now</span>
                              <span className="text-lg">⚡️</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg">
                              <span className="text-lg font-bold">
                                {Number(listing.price).toLocaleString()}
                              </span>
                              <span className="text-sm opacity-90">tokens</span>
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-100/50 border border-purple-200/50">
                          <span className="text-purple-700 font-medium">Your Price</span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {Number(listing.price).toLocaleString()}
                            </span>
                            <span className="text-sm text-purple-600">tokens</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      // ... rest of the existing cases ...
    }
  };

  const renderContent = () => {
    // Check for direct image messages or completed image generation actions
    if (message.isImage || 
        (message.analysis?.action?.type === 'generateImage' && message.analysis?.actionExecuted) ||
        (message.analysis?.actionResult?.isImage)) {
      
      // Get image URL from the appropriate location
      const imageUrl = message.isImage ? message.content : 
                      message.analysis?.actionResult?.content || 
                      message.content;
                      
      // Get prompt from the appropriate location
      const prompt = message.prompt || 
                    message.analysis?.actionResult?.prompt ||
                    message.analysis?.action?.data?.prompt;
      
      console.log('Rendering image message:', { message, imageUrl, prompt });
      
      return (
        <div className="mt-2 relative">
          <div className="relative w-full aspect-square max-w-[512px] mx-auto">
            <img 
              src={imageUrl} 
              alt={`AI generated image: ${prompt}`}
              className="rounded-lg w-full h-full object-cover shadow-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center p-4">
              <div className="text-white text-sm text-center">
                {prompt}
              </div>
            </div>
          </div>
        </div>
      );
    }

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
            {messageContent}
          </div>
        ) : message.role === 'assistant' ? (
          <>
            <div className={`text-base sm:text-lg font-medium ${isTyping ? 'after:content-["▋"] after:ml-0.5 after:animate-blink after:text-purple-600' : ''}`}>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {displayedText}
              </span>
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />

            {message.analysis?.action?.status === 'pending' && !completedActions.has(message.timestamp) && (
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
                {/* Search Bar */}
                <div className="mb-2 flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Search by title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="px-2 py-2 border rounded-md"
                  >
                    <option value="global">Global Listings</option>
                    <option value="my">My Listings</option>
                  </select>
                  <select
                    value={creationFilter}
                    onChange={(e) => setCreationFilter(e.target.value)}
                    className="px-2 py-2 border rounded-md"
                  >
                    <option value="global">Global Creations</option>
                    <option value="my">My Creations</option>
                  </select>
                </div>
                {filteredListings?.length > 0 ? (
                  <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4">
                    {filteredListings.map((listing, index) => {
                      const isOwnedByUser = listing.currentOwnerUsername === message.user?.username;
                      return (
                        <div key={index} 
                             className={`group relative flex-none w-[300px] rounded-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                               isOwnedByUser 
                                 ? 'bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-purple-50/80 border-2 border-purple-200/50 shadow-lg hover:shadow-purple-200/25' 
                                 : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50 shadow-md hover:shadow-xl'
                             }`}>
                          
                          {/* Image Container - Moved to top with no padding */}
                          {listing.imageUrl && (
                            <div className="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                              <img 
                                src={listing.imageUrl} 
                                alt={listing.title}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                loading="lazy"
                              />
                              {listing.imagePrompt && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
                                  <div className="w-full backdrop-blur-sm bg-black/30 p-3">
                                    <p className="text-xs text-white/90 line-clamp-2 font-medium">{listing.imagePrompt}</p>
                                  </div>
                                </div>
                              )}
                              {/* Listing Badge - Moved inside image */}
                              <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg
                                backdrop-blur-md transition-all duration-300 border ${
                                isOwnedByUser 
                                  ? 'bg-purple-500/70 border-purple-300/30 text-white group-hover:bg-purple-500/90' 
                                  : 'bg-emerald-500/70 border-emerald-300/30 text-white group-hover:bg-emerald-500/90'
                              }`}>
                                {isOwnedByUser ? 'My Listing' : 'Available'}
                              </div>
                            </div>
                          )}
                          
                          {/* Content Container */}
                          <div className="p-5 space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">
                                {listing.title}
                              </h3>
                              <p className="text-sm text-gray-600/90 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                                {listing.description || 'No description provided'}
                              </p>
                            </div>

                            {/* Owner & Creator Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-gray-100/80 group-hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors duration-300">
                                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">{listing.currentOwnerDisplayName || listing.currentOwnerUsername}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-100/80 group-hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors duration-300">
                                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">Created by {listing.creatorDisplayName || listing.creatorUsername}</span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="pt-2">
                              {!isOwnedByUser ? (
                                <button 
                                  onClick={() => handleBuyClick(listing)}
                                  className="group/btn relative w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold 
                                           hover:from-emerald-600 hover:to-green-600 transform transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-emerald-200/50"
                                >
                                  <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                  <div className="relative flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                      <span>Buy Now</span>
                                      <span className="text-lg">⚡️</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg">
                                      <span className="text-lg font-bold">
                                        {Number(listing.price).toLocaleString()}
                                      </span>
                                      <span className="text-sm opacity-90">tokens</span>
                                    </span>
                                  </div>
                                </button>
                              ) : (
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-100/50 border border-purple-200/50">
                                  <span className="text-purple-700 font-medium">Your Price</span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                      {Number(listing.price).toLocaleString()}
                                    </span>
                                    <span className="text-sm text-purple-600">tokens</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No listings found</div>
                )}
              </div>
            ) : null}
          </div>
        ) : message.analysis?.action?.type === 'fetchNotifications' ? (
          <div className="space-y-2">
            {console.log('Rendering notification message:', {
              content: message.content,
              actionResult: message.analysis?.actionResult,
              notifications: message.analysis?.actionResult?.notifications
            })}
            
            {/* Display the message text */}
            <div className="text-base sm:text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              {typeof message.content === 'string' ? message.content : message.content.text}
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />
            
            {/* Get notifications from actionResult */}
            {(() => {
              const notifications = message.analysis?.actionResult?.notifications || [];
              console.log('Processing notifications:', notifications);

              if (notifications?.length > 0) {
                return (
                  <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 mt-4">
                    {notifications.map((notification, index) => {
                      console.log('Processing notification:', notification);
                      
                      // Format date
                      const createdAt = new Date(notification.createdAt);
                      const timestamp = new Date(notification.data?.timestamp);

                      return (
                        <div key={notification._id || index} 
                          className="group relative flex-none w-[300px] p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1
                            bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md hover:shadow-lg"
                        >
                          <div className={`absolute -right-1 top-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg
                            ${notification.type === 'LISTING_SOLD' 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                              : notification.type === 'LISTING_PURCHASED'
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white`}
                          >
                            {notification.type === 'LISTING_SOLD' ? 'Sale' :
                             notification.type === 'LISTING_PURCHASED' ? 'Purchase' :
                             'Balance Update'}
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full 
                                ${notification.type === 'LISTING_SOLD'
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                  : notification.type === 'LISTING_PURCHASED'
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                } text-white flex items-center justify-center text-lg shadow-lg`}
                              >
                                {notificationData.type === 'LISTING_SOLD' ? '💰'
                                  : notificationData.type === 'LISTING_PURCHASED' ? '🛍️'
                                  : '💎'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notificationData.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notificationData.createdAt.toLocaleString()}
                                </p>
                                {notificationData.data?.amount > 0 && (
                                  <p className="text-xs font-medium text-emerald-600 mt-1">
                                    {notificationData.data.amount} tokens
                                  </p>
                                )}
                                {notificationData.data?.newBalance > 0 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    New balance: {notificationData.data.newBalance} tokens
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              
              return (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No transactions found</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
                </div>
              );
            })()}
          </div>
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