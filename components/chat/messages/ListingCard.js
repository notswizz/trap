import React from 'react';

export default function ListingCard({ listing, isOwnedByUser, onBuyClick, message }) {
  return (
    <div 
      className={`group relative flex-none w-[260px] sm:w-[280px] rounded-xl transition-all duration-300 transform hover:-translate-y-1 snap-center ${
        isOwnedByUser 
          ? 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border border-purple-200/50 shadow-md hover:shadow-lg' 
          : 'bg-gradient-to-br from-white/95 to-gray-50/95 border border-gray-200/50 shadow-sm hover:shadow-md'
      }`}>
      
      {/* Image Container */}
      {listing.imageUrl && (
        <div className="relative w-full aspect-[3/2] rounded-t-xl overflow-hidden">
          <img 
            src={listing.imageUrl} 
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Listing Badge */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-medium
            backdrop-blur-md ${
            isOwnedByUser 
              ? 'bg-purple-500/80 text-white' 
              : 'bg-emerald-500/80 text-white'
          }`}>
            {isOwnedByUser ? 'My Listing' : 'Available'}
          </div>
        </div>
      )}
      
      {/* Content Container */}
      <div className="p-2 space-y-1.5">
        <div>
          <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-xs text-gray-600/90 line-clamp-1">
            {listing.description || 'No description provided'}
          </p>
        </div>

        {/* Owner & Creator Info */}
        <div className="flex items-center gap-1 flex-wrap text-[11px]">
          <div className="flex items-center gap-1 bg-gray-100/80 px-1.5 py-0.5 rounded-md">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-gray-600">{listing.currentOwnerDisplayName || listing.currentOwnerUsername}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100/80 px-1.5 py-0.5 rounded-md">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="font-medium text-gray-600">{listing.creatorDisplayName || listing.creatorUsername}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div>
          {!isOwnedByUser ? (
            <button 
              onClick={() => onBuyClick(listing)}
              className="group/btn relative w-full px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium text-sm
                       hover:from-emerald-600 hover:to-green-600 transform transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Buy</span>
                  <span>⚡️</span>
                </span>
                <span className="flex items-center pl-2 ml-2 border-l border-white/20">
                  <span className="font-bold">
                    {Number(listing.price).toLocaleString()}
                  </span>
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-purple-100/50 border border-purple-200/50">
              <span className="text-purple-700 text-sm font-medium">Price</span>
              <span className="flex items-center">
                <span className="font-bold text-purple-700">
                  {Number(listing.price).toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 