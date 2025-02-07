import { useState, useRef, useEffect } from 'react';

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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    <div className="h-[500px] w-full max-w-3xl mx-auto flex flex-col 
      bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 
      rounded-2xl shadow-xl shadow-purple-500/10 overflow-hidden 
      border border-purple-200/30 backdrop-blur-lg
      relative before:absolute before:inset-0 
      before:bg-gradient-to-br before:from-purple-500/5 before:via-transparent before:to-emerald-500/5 
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-1000">
      
      {showTitle ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1),transparent_70%)]" />
          
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8 relative group">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent
              [background-size:200%] group-hover:[background-position:100%] [background-position:0%]
              transition-all duration-1000">
              gpt
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent
              [background-size:200%] group-hover:[background-position:100%] [background-position:0%]
              transition-all duration-1000">
              SILK
            </span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-emerald-500/0
              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"/>
          </h1>
          
          <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
            {QUICK_PHRASES.map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={isLoading}
                className="group p-4 text-sm font-medium relative
                  bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/50
                  hover:from-purple-50 hover:to-indigo-100/80
                  border border-purple-200/30 hover:border-purple-300/50
                  rounded-xl shadow-sm hover:shadow-md hover:shadow-purple-500/10
                  transition-all duration-500 ease-out
                  transform hover:-translate-y-0.5 active:translate-y-0
                  backdrop-blur-sm overflow-hidden
                  text-gray-700 hover:text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex flex-col items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-emerald-500/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <span className="text-xl transform group-hover:scale-110 transition-transform duration-500 relative z-10">
                  {phrase.icon}
                </span>
                <span className="relative z-10">{phrase.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Phrases - Top Band */}
          <div className="p-4 border-b border-purple-100/30 flex gap-3 overflow-x-auto whitespace-nowrap
            scrollbar-thin scrollbar-thumb-purple-200/50 scrollbar-track-transparent
            bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/30 backdrop-blur-lg
            relative before:absolute before:inset-0 
            before:bg-gradient-to-r before:from-purple-500/5 before:to-emerald-500/5 
            before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
            {QUICK_PHRASES.map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={isLoading}
                className="group px-4 py-2 text-sm font-medium relative
                  bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/50
                  hover:from-purple-50/80 hover:to-indigo-100/80
                  border border-purple-200/30 hover:border-purple-300/50
                  rounded-xl shadow-sm hover:shadow-md hover:shadow-purple-500/10
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-0.5 active:translate-y-0
                  flex-shrink-0 backdrop-blur-sm overflow-hidden
                  text-gray-700 hover:text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-emerald-500/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {phrase.icon}
                </span>
                <span className="relative z-10">{phrase.text}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200/50 scrollbar-track-transparent">
              <div className="min-h-full p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg relative overflow-hidden
                        transform transition-transform duration-300 hover:scale-[1.02] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-white/90 border border-purple-100/30 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className={`absolute inset-0 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                          : 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50'
                      } opacity-0 hover:opacity-100 transition-opacity duration-300`}/>
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px] relative z-10">{message.content}</p>
                      <div className={`text-xs mt-2 flex items-center gap-1.5 relative z-10 ${
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
                    <div className="bg-white/90 border border-purple-100/30 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 animate-bounce shadow-sm" />
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 animate-bounce [animation-delay:0.2s] shadow-sm" />
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 animate-bounce [animation-delay:0.4s] shadow-sm" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 