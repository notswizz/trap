import React, { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import ListingForm from './ListingForm';
import NotificationCard from './NotificationCard';
import ActionConfirmation from './ActionConfirmation';

export default function MessageContent({ 
  message, 
  displayedText, 
  isTyping,
  handleActionConfirmation,
  completedActions,
  isLoading,
  handleBuyClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('global');
  const [creationFilter, setCreationFilter] = useState('global');
  const listings = message.analysis?.actionResult?.listings || [];

  const filteredListings = message.analysis?.action?.type === 'fetchListings'
    ? listings.filter(listing => {
        let matches = true;
        if (searchTerm) {
          matches = matches && listing.title.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (ownerFilter === 'my' && message.user?.username) {
          matches = matches && listing.currentOwnerUsername?.toLowerCase() === message.user.username.toLowerCase();
        }
        if (creationFilter === 'my' && message.user?.username) {
          matches = matches && listing.creatorUsername?.toLowerCase() === message.user.username.toLowerCase();
        }
        return matches;
      })
    : [];

  // Handle image messages
  if (message.isImage || 
      (message.analysis?.action?.type === 'generateImage' && message.analysis?.actionExecuted) ||
      (message.analysis?.actionResult?.isImage)) {
    
    const imageUrl = message.isImage ? message.content : 
                    message.analysis?.actionResult?.content || 
                    message.content;
                    
    const prompt = message.prompt || 
                  message.analysis?.actionResult?.prompt ||
                  message.analysis?.action?.data?.prompt;
    
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

  // Handle welcome message
  if (message.isWelcome) {
    return (
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
    );
  }

  // Handle user messages
  if (message.role === 'user') {
    return <div>{message.content}</div>;
  }

  // Handle assistant messages
  if (message.role === 'assistant') {
    // For create listing actions, only show one component based on state
    if (message.analysis?.action?.type === 'createListing') {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 
              flex items-center justify-center shadow-lg mb-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              Creating Your Listing
            </h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Generating AI image and publishing...
            </p>
            <div className="mt-6 w-full max-w-[300px]">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress-indeterminate" />
              </div>
            </div>
          </div>
        );
      }

      if (message.analysis.actionExecuted && message.analysis.actionResult?.listing) {
        return (
          <div className="space-y-4">
            <div className="text-base font-medium text-gray-900">
              ✨ Listing Created Successfully
            </div>
            <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
              <img 
                src={message.analysis.actionResult.listing.imageUrl} 
                alt={message.analysis.actionResult.listing.title}
                className="w-full h-full object-cover shadow-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="w-full">
                  <h3 className="text-white font-bold text-lg">
                    {message.analysis.actionResult.listing.title}
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    {message.analysis.actionResult.listing.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-white/80 text-sm">Price</div>
                    <div className="text-white font-bold">
                      {message.analysis.actionResult.listing.price} tokens
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (!completedActions.has(message.timestamp)) {
        return (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 p-4">
              <ListingForm 
                message={message}
                handleActionConfirmation={handleActionConfirmation}
                completedActions={completedActions}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
      }

      return null;
    }

    // For all other message types
    return (
      <>
        <div className={`text-base sm:text-lg font-medium ${isTyping ? 'after:content-["▋"] after:ml-0.5 after:animate-blink after:text-purple-600' : ''}`}>
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            {displayedText}
          </span>
        </div>
        <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />

        {/* Handle action confirmation for non-createListing actions */}
        {message.analysis?.action?.status === 'pending' && 
         !completedActions.has(message.timestamp) && 
         message.analysis?.action?.type !== 'createListing' && (
          <ActionConfirmation 
            message={message}
            handleActionConfirmation={handleActionConfirmation}
            completedActions={completedActions}
            isLoading={isLoading}
          />
        )}

        {/* Handle listings display */}
        {message.analysis?.action?.type === 'fetchListings' && (
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
              <div className="flex flex-nowrap gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {filteredListings.map((listing, index) => (
                  <ListingCard 
                    key={index}
                    listing={listing}
                    isOwnedByUser={listing.currentOwnerUsername === message.user?.username}
                    onBuyClick={handleBuyClick}
                    message={message}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No listings found</div>
            )}
          </div>
        )}

        {/* Handle notifications */}
        {message.analysis?.action?.type === 'fetchNotifications' && (
          <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 mt-4">
            {message.analysis?.actionResult?.notifications?.map((notification, index) => (
              <NotificationCard key={index} notification={notification} />
            ))}
          </div>
        )}
      </>
    );
  }

  return null;
} 