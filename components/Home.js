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

        <h2 className="relative mt-2 sm:mt-4 max-w-3xl mx-auto text-sm sm:text-lg md:text-xl font-medium px-4 sm:px-0 
          bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl py-3 sm:py-4 shadow-lg 
          flex items-center justify-center whitespace-nowrap overflow-hidden">
          <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 bg-clip-text text-transparent animate-pulse inline-block">
            {'<'}
          </span>
          <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent inline-block mx-2 font-mono">
            {listings.length > 0 && (
              <Typewriter
                options={{
                  strings: listings,
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 20,
                  pauseFor: 2000,
                  cursor: '|',
                }}
              />
            )}
          </span>
          <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 bg-clip-text text-transparent animate-pulse inline-block">
            {'/>'} 
          </span>
        </h2>
      </div>
     
      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 max-w-6xl mx-auto px-4">
        {[
          { 
            title: 'Intelligent Marketplace',
            description: 'Experience dynamic, AI-powered listings that adapt to your needs. Create, browse and trade seamlessly with other users.',
            icon: '🏪'
          },
          { 
            title: 'Smart Wallet Integration', 
            description: 'Watch your digital wallet grow as you trade. Track your balance and transaction history with enterprise-grade security.',
            icon: '💰'
          },
          { 
            title: 'Evolving AI Assistant',
            description: 'Chat with our state-of-the-art AI that learns from each interaction, providing increasingly personalized help with trades and listings.',
            icon: '🤖'
          }
        ].map((feature, index) => (
          <div key={index} className="p-8 bg-gradient-to-br from-white/80 via-purple-50/50 to-emerald-50/50 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-indigo-200/30">
            <div className="mx-auto mb-6 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border border-indigo-100/30 hover:scale-110 transition-transform duration-300">
              <span className="text-5xl filter drop-shadow-md">{feature.icon}</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center mb-4">{feature.title}</h3>
            <p className="mt-3 text-gray-700 leading-relaxed text-center">
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{'< '}</span>
              {feature.description}
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{' />'}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 