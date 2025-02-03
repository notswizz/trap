import Typewriter from 'typewriter-effect';

export default function HomeContent() {
  return (
    <div className="text-center space-y-8 px-4 sm:px-0">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-indigo-600 rounded-full filter blur-3xl -ml-10 sm:-ml-20"></div>
          <div className="w-32 sm:w-64 h-32 sm:h-64 bg-pink-600 rounded-full filter blur-3xl -ml-5 sm:-ml-10"></div>
        </div>
        <h2 className="relative text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          <Typewriter
            options={{
              strings: [
                'Your Infinite Marketplace',
                'Trade, Chat, Create',
                'AI Trading Platform',
                'Discover Endless Possibilities'
              ],
              autoStart: true,
              loop: true,
              delay: 75,
            }}
          />
        </h2>
      </div>
      <p className="mt-4 sm:mt-6 max-w-md mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 font-medium leading-relaxed px-4 sm:px-0">
        Create and browse listings via AI chat, manage your digital wallet, and trade with confidence. Your infinite marketplace awaits.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 sm:pt-8">
        <button
          onClick={() => window.toggleModal?.()}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium 
          hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Get Started
        </button>
        <button
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-gray-900 font-medium border border-gray-200
          hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Learn More
        </button>
      </div>
      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 max-w-6xl mx-auto px-4">
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
          <div key={index} className="p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{feature.title}</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 