import React from 'react';

export default function ChatInput({ input, setInput, handleSubmit, isLoading, isNewConversation = false }) {
  const promptButtons = [
    { 
      label: '💰 Add Balance', 
      action: 'updateBalance',
      prompt: 'I would like to add more tokens to my balance'
    },
    { 
      label: '📋 View Listings', 
      action: 'fetchListings',
      prompt: 'Show me all available listings'
    },
    { 
      label: '✨ Create Listing', 
      action: 'createListing',
      prompt: 'I want to create a new listing'
    },
    { 
      label: '❓ FAQ', 
      action: 'none',
      prompt: 'What can I do in this marketplace? Please explain the available actions and how to use them.'
    }
  ];

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    // Optional: Auto-submit the prompt
    handleSubmit(new Event('submit'), prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm space-y-4">
      {isNewConversation && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 justify-center">
          {promptButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={() => handlePromptClick(button.prompt)}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 
                hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm
                transition-all duration-300 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        <div className="relative w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={(e) => setInput(e.target.value)}
            placeholder={isNewConversation ? "Try: 'show listings' or 'add 100 tokens'" : "Type your message..."}
            className="chat-input w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200/80 bg-white/90 
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent 
              placeholder-gray-400 text-gray-700 text-sm shadow-sm
              disabled:bg-gray-50/90 disabled:cursor-not-allowed transition-all duration-300
              hover:border-indigo-200 hover:shadow-md"
            disabled={isLoading}
          />
        </div>

        {input.trim() && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-3 sm:py-4
              bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white 
              rounded-xl sm:rounded-2xl font-medium text-base
              hover:shadow-lg hover:shadow-indigo-500/30 active:shadow-inner
              transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none 
              disabled:hover:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </div>
          </button>
        )}
      </div>
    </form>
  );
} 