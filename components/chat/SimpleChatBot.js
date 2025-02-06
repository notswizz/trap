import { useState } from 'react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "👋 Welcome to gptSILK! I'm your AI guide to the marketplace. Choose a topic below to learn more!",
  timestamp: new Date()
};

const PRESET_RESPONSES = {
  default: "To access the full features of gptSILK, including AI trading and marketplace access, please log in or create an account. Would you like to know more about what you can do on gptSILK?",
  features: "gptSILK currently offers three core features:\n\n1. 💰 Digital Wallet\n• Secure balance management\n• Real-time transaction tracking\n• Full financial history\n\n2. 🏪 AI Marketplace\n• Create and list AI models\n• Trade with other users\n• Set custom prices\n\n3. 🤖 AI Companion\n• 24/7 trading assistant\n• Market insights\n• Personalized guidance\n\nReady to start trading? Login to begin!",
  about: "gptSILK is an infinite AI economy powered by a chatbot interface where you can:\n\n🌟 Access an unlimited marketplace of AI models\n💫 Trade digital assets seamlessly\n🤝 Join a growing community of traders\n🔮 Shape the future of AI commerce\n\nThink of it as a new digital economy where AI and human creativity combine to create endless possibilities.",
  how: "Getting started is quick and easy:\n\n1. 🔑 Click 'Login' in the top right corner\n2. 📝 Enter your username\n3. 💼 Start trading immediately!\n\nReady to join the AI economy?",
  pricing: "Here's how pricing works on gptSILK:\n\n🎮 The app itself is completely free\n💰 Trading listings requires real money\n💎 Set your own prices as a seller\n✨ Earn from your AI creations\n\nCreate an account to see current market prices!",
  security: "Your security is our highest priority:\n\n🔒 Enterprise-grade encryption\n🛡️ Advanced AI security systems\n✅ Continuous monitoring\n💼 Secure trading environment\n\nTrade with complete confidence on gptSILK!",
  contact: "Stay connected with gptSILK:\n\n🐦 Follow us @gptsilk on X\n📧 Get updates by creating an account\n💫 Join our growing community\n\nDon't miss out on the future of AI trading!"
};

const QUICK_PHRASES = [
  { text: "What is gptSILK?", category: "about", icon: "🌟" },
  { text: "Show features", category: "features", icon: "✨" },
  { text: "How to start?", category: "how", icon: "🚀" },
  { text: "Does it cost?", category: "pricing", icon: "💎" },
  { text: "Is it secure?", category: "security", icon: "🔒" },
  { text: "Keep in touch", category: "contact", icon: "🤝" },
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white border border-indigo-100/50 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                  <div className={`text-xs mt-2 flex items-center gap-1.5 ${
                    message.role === 'user' 
                      ? 'text-indigo-200'
                      : 'text-gray-400'
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                    </svg>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-indigo-100/50 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
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