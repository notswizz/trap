import React from 'react';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
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
                               className={`group relative flex-none w-[300px] p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                                 isOwnedByUser 
                                   ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 shadow-lg hover:shadow-xl' 
                                   : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md hover:shadow-lg'
                               }`}>
                            {/* Listing Badge */}
                            <div className={`absolute -right-1 top-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                              isOwnedByUser 
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            }`}>
                              {isOwnedByUser ? 'My Listing' : 'Available'}
                            </div>
                            
                            {/* Main Content */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{listing.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {listing.description || 'No description provided'}
                                </p>
                              </div>

                              {/* Owner & Creator Info */}
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">{listing.currentOwnerDisplayName || listing.currentOwnerUsername}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    <span>Created by {listing.creatorDisplayName || listing.creatorUsername}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Price & Action */}
                              <div className="pt-2">
                                {!isOwnedByUser ? (
                                  <button 
                                    onClick={() => handleBuyClick(listing)}
                                    className="group/btn relative w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold 
                                             hover:from-emerald-600 hover:to-green-600 transform transition-all duration-200 active:scale-[0.98]"
                                  >
                                    <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
                                    <div className="relative flex items-center justify-between">
                                      <span>Buy Now</span>
                                      <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg">
                                        <span className="text-lg font-bold">
                                          {Number(listing.price).toLocaleString()}
                                        </span>
                                        <span className="text-sm opacity-90">tokens</span>
                                      </span>
                                    </div>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-purple-100/50 border border-purple-200">
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