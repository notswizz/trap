import React from 'react';

export default function ChatInput({ input, setInput, handleSubmit, isLoading }) {
  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex space-x-2 sm:space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200/80 bg-white/90 
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent 
            placeholder-gray-400 text-gray-700 text-sm shadow-sm
            disabled:bg-gray-50/90 disabled:cursor-not-allowed transition-all duration-300
            hover:border-indigo-200 hover:shadow-md"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl
          hover:shadow-lg hover:shadow-indigo-500/30 active:shadow-inner
          transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none 
          disabled:hover:transform-none text-sm font-medium min-w-[70px] sm:min-w-[90px]
          border border-indigo-500/20`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
} 