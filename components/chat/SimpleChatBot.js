import { useState } from 'react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "👋 Welcome to gptSILK! I'm your AI guide to the marketplace. Choose a topic below to learn more!",
  timestamp: new Date()
};

const PRESET_RESPONSES = {
  default: "To access the full features of gptSILK, including AI trading and marketplace access, please log in or create an account. Would you like to know more about what you can do on gptSILK?",
  features: "gptSILK offers three powerful features:\n\n1. 🏪 AI Marketplace\n• Browse and trade AI models\n• Customize AI behaviors\n• Set your own prices\n\n2. 💰 Smart Wallet\n• Secure transactions\n• Real-time balance tracking\n• Transaction history\n\n3. 🤖 AI Assistant\n• 24/7 trading support\n• Market insights\n• Personalized recommendations\n\nReady to explore? Click the login button to get started!",
  about: "gptSILK is a revolutionary AI marketplace where you can:\n\n🌟 Trade AI models like never before\n🔄 Create and customize AI behaviors\n💡 Monetize your AI innovations\n🤝 Join a community of AI enthusiasts\n\nThink of it as a decentralized App Store for AI, where anyone can be both a creator and consumer of AI services.",
  how: "Getting started is easy:\n\n1. 📝 Create your account\n2. 💼 Set up your wallet\n3. 🔍 Browse the marketplace\n4. 💫 Start trading or create listings\n\nWould you like to sign up now?",
  pricing: "gptSILK uses a flexible pricing model:\n\n💎 Creators set their own prices\n💫 Pay-per-use or subscription options\n🎯 Dynamic pricing based on demand\n✨ Rewards for popular listings\n\nStart exploring the marketplace to see current prices!",
  security: "Your security is our priority:\n\n🔒 End-to-end encryption\n💼 Secure wallet integration\n✅ Regular security audits\n🛡️ Advanced fraud protection\n\nTrade with confidence on gptSILK!",
};

const QUICK_PHRASES = [
  { text: "What is gptSILK?", category: "about", icon: "🌟" },
  { text: "Show me features", category: "features", icon: "✨" },
  { text: "How to start?", category: "how", icon: "🚀" },
  { text: "Pricing info", category: "pricing", icon: "💎" },
  { text: "Is it secure?", category: "security", icon: "🔒" },
  { text: "Trading guide", category: "how", icon: "📈" },

];

export default function SimpleChatBot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTitle, setShowTitle] = useState(true);

  const simulateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = PRESET_RESPONSES.default;

    if (lowerMessage.includes('feature') || lowerMessage.includes('offer') || lowerMessage.includes('what can')) {
      response = PRESET_RESPONSES.features;
    } else if (lowerMessage.includes('about') || lowerMessage.includes('what is')) {
      response = PRESET_RESPONSES.about;
    } else if (lowerMessage.includes('how') || lowerMessage.includes('start')) {
      response = PRESET_RESPONSES.how;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = PRESET_RESPONSES.pricing;
    } else if (lowerMessage.includes('secure') || lowerMessage.includes('safety')) {
      response = PRESET_RESPONSES.security;
    }

    return response;
  };

  const handleQuickPhrase = (phrase) => {
    if (isLoading) return;
    setShowTitle(false); // Hide title when interaction starts
    
    const userMessage = {
      role: 'user',
      content: phrase.text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const response = {
        role: 'assistant',
        content: simulateResponse(phrase.text),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-[500px] w-full max-w-3xl mx-auto flex flex-col bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 
      rounded-2xl shadow-xl overflow-hidden border border-indigo-200/50 backdrop-blur-sm">
      
      {showTitle ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              gpt
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              SILK
            </span>
          </h1>
          
          <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
            {QUICK_PHRASES.map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={isLoading}
                className="p-4 text-sm font-medium
                  bg-gradient-to-br from-white via-purple-50 to-indigo-50
                  hover:from-purple-50 hover:to-indigo-100
                  border border-indigo-200/50 hover:border-indigo-300/70
                  rounded-xl shadow-sm hover:shadow-md
                  transition-all duration-300 ease-in-out
                  transform hover:-translate-y-0.5 active:translate-y-0
                  backdrop-blur-sm
                  text-gray-700 hover:text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex flex-col items-center gap-2"
              >
                <span className="text-xl">{phrase.icon}</span>
                <span>{phrase.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Phrases - Top Band */}
          <div className="p-4 border-b border-indigo-100/50 flex gap-3 overflow-x-auto whitespace-nowrap
            scrollbar-thin scrollbar-thumb-indigo-200/50 scrollbar-track-transparent
            bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30 backdrop-blur-sm">
            {QUICK_PHRASES.map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium
                  bg-gradient-to-br from-white via-purple-50 to-indigo-50
                  hover:from-purple-50 hover:to-indigo-100
                  border border-indigo-200/50 hover:border-indigo-300/70
                  rounded-xl shadow-sm hover:shadow-md
                  transition-all duration-300 ease-in-out
                  transform hover:-translate-y-0.5 active:translate-y-0
                  flex-shrink-0 backdrop-blur-sm
                  text-gray-700 hover:text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                <span>{phrase.icon}</span>
                <span>{phrase.text}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-gradient-to-br from-white to-purple-50/50 border border-indigo-100/50 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-white to-purple-50/50 border border-indigo-100/50 
                  rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-pink-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 