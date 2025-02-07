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
        <div className="relative w-full group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-emerald-500 to-indigo-600 
            rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-500
            group-focus-within:opacity-100 group-focus-within:animate-tilt"/>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-emerald-500 to-indigo-600 
            rounded-xl sm:rounded-2xl opacity-0 group-focus-within:opacity-100 
            animate-[gradient-rotate_3s_ease-in-out_infinite]"/>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={(e) => setInput(e.target.value)}
            placeholder={isNewConversation ? "Try: 'show listings' or 'add 100 tokens'" : "Type your message..."}
            className="relative chat-input w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl 
              border border-purple-100/20 bg-white/90 
              focus:outline-none focus:ring-0 focus:border-transparent
              placeholder-gray-400 text-gray-700 text-sm
              disabled:bg-gray-50/90 disabled:cursor-not-allowed transition-all duration-300
              shadow-md hover:shadow-lg backdrop-blur-sm
              group-hover:bg-white group-focus-within:bg-white
              group-focus-within:shadow-lg group-focus-within:shadow-purple-500/10"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
            {input.trim() && !isLoading && (
              <span className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 
                bg-clip-text text-transparent animate-pulse">
                 
              </span>
            )}
            {isLoading && (
              <div className="w-5 h-5 relative flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-2 border-purple-600/20 
                  border-l-purple-600 animate-spin"/>
              </div>
            )}
          </div>
        </div>

        {input.trim() && (
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl 
              overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5 
              active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:hover:transform-none bg-white"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 group-hover:from-emerald-500 group-hover:via-green-500 group-hover:to-teal-500 transition-all duration-300"/>
            <div className="absolute inset-[1px] bg-white rounded-xl sm:rounded-2xl"/>
            <div className="relative flex items-center justify-center gap-2 font-medium text-base">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 group-hover:from-emerald-500 group-hover:via-green-500 group-hover:to-teal-500 transition-all duration-300 bg-clip-text text-transparent">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 relative flex items-center justify-center">
                      <div className="absolute w-full h-full rounded-full border-2 border-emerald-600/20 
                        border-l-emerald-600 animate-spin"/>
                    </div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send Message</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.5 10.5L21 3m0 0l-7.5 7.5M21 3H3"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </button>
        )}
      </div>
    </form>
  );
} 