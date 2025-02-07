import Typewriter from 'typewriter-effect';
import SimpleChatBot from './chat/SimpleChatBot';
import { useState, useEffect } from 'react';

export default function HomeContent() {
  const [listings, setListings] = useState([
    // Default listings while loading
    "AI Trading Bot • 50 • Automated trading strategies",
    "Neural Network • 75 • Custom ML model"
  ]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings/featured');
      const data = await res.json();
      
      if (!data.listings?.length) {
        throw new Error('No listings found');
      }

      // Simpler format: just title, price number, and description
      const formattedListings = data.listings.map(listing => {
        const price = listing.price?.$numberInt || listing.price || 0;
        return `${listing.title} • ${price} • ${listing.description}`;
      });

      console.log('Formatted listings:', formattedListings);
      setListings(formattedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Keep using default listings if fetch fails
    }
  };

  return (
    <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-0 pt-2 sm:pt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-indigo-600 rounded-full filter blur-3xl -ml-10 sm:-ml-20"></div>
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-pink-600 rounded-full filter blur-3xl -ml-5 sm:-ml-10"></div>
        </div>
        
        <SimpleChatBot />

        <h2 className="relative mt-2 sm:mt-4 max-w-3xl mx-auto text-sm sm:text-lg md:text-xl font-medium 
          bg-gradient-to-br from-white/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-xl 
          rounded-2xl py-3 sm:py-4 shadow-lg shadow-purple-500/10
          border border-purple-200/30
          flex items-center justify-center whitespace-nowrap overflow-hidden
          group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent 
            group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600
            transition-all duration-500 [text-shadow:0_2px_10px_rgba(147,51,234,0.2)]">
            {'<'}
          </span>
          <span className="bg-gradient-to-r from-purple-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent 
            inline-block mx-2 font-mono relative group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-emerald-600
            transition-all duration-500">
            {listings.length > 0 && (
              <Typewriter
                options={{
                  strings: listings,
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 20,
                  pauseFor: 2000,
                  cursor: '▌',
                  cursorClassName: 'text-purple-500/50 animate-pulse',
                  wrapperClassName: 'font-medium tracking-tight',
                }}
              />
            )}
          </span>
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent
            group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600
            transition-all duration-500 [text-shadow:0_2px_10px_rgba(147,51,234,0.2)]">
            {'/>'} 
          </span>
        </h2>
      </div>
     
      
    </div>
  );
} 