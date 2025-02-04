import React from 'react';

export default function ChatMessage({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  console.log('Message props:', { 
    isWelcome: message.isWelcome,
    content: message.content,
    role: message.role 
  });

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
            : message.isAction
            ? message.isPending
              ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 text-amber-800 border border-amber-200/50 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm'
              : message.analysis?.action?.status === 'completed'
                ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/50 shadow-md backdrop-blur-sm'
                : 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 border border-rose-200/50 shadow-md backdrop-blur-sm'
            : message.isWelcome
            ? 'bg-gradient-to-br from-white via-purple-50 to-emerald-50 border border-purple-100/50 shadow-lg'
            : 'bg-gradient-to-br from-white via-purple-50/30 to-emerald-50/30 text-gray-800 rounded-bl-none border border-purple-100/50 shadow-md backdrop-blur-sm'
        }`}
      >
        <div className={`whitespace-pre-wrap text-sm sm:text-md leading-relaxed ${
          message.isAction ? 'font-medium' : message.role === 'assistant' ? 'font-medium' : ''
        }`}>
          {message.isWelcome ? (
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent font-black">
                    gpt
                  </span>
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-black">
                    SILK
                  </span>
                </div>
                <div className="flex items-center text-[10px] sm:text-xs font-medium tracking-wide
                  bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400 
                  bg-clip-text text-transparent uppercase gap-0.5 sm:gap-1">
                  <span className="text-sm sm:text-base">∞</span> 
                  <span>infinite AI economy</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
                  <span className="text-gray-500 text-xs sm:text-sm mr-1 hidden sm:inline">Tokens:</span>
                  <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                    {message.content.tokens.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  Ready to trade
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className={`${message.role === 'assistant' ? 'space-y-1' : ''}`}>
              {message.role === 'assistant' && !message.isAction ? (
                <>
                  <div className="text-base sm:text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    {typeof message.content === 'string' ? message.content : message.content.text}
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-full" />
                </>
              ) : message.isAction && !message.isPending ? (
                <div className="flex flex-col gap-2">
                  {message.analysis?.action?.status === 'completed' ? (
                    <>
                      <div className="inline-flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-400/10 to-green-500/10 border border-emerald-200 text-emerald-700">
                          Confirmed
                        </div>
                      </div>
                      {message.analysis.action.type === 'updateBalance' ? (
                        <div className="font-medium">
                          Balance updated from{' '}
                          <span className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {Number(message.analysis.actionResult.balance - message.analysis.action.data.amount).toLocaleString()}
                          </span>
                          {' '}to{' '}
                          <span className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {Number(message.analysis.actionResult.balance).toLocaleString()}
                          </span>
                          {' '}tokens
                        </div>
                      ) : message.analysis.action.type === 'fetchListings' ? (
                        <div className="space-y-2">
                          {message.analysis.actionResult.listings?.length > 0 ? (
                            <div className="grid gap-2">
                              {message.analysis.actionResult.listings.map((listing, index) => (
                                <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">{listing.title}</div>
                                    <div className="text-sm text-gray-500">by {listing.owner}</div>
                                  </div>
                                  <div className="px-2 py-1 rounded-md text-sm font-medium bg-gradient-to-r from-emerald-400/10 to-green-500/10 border border-emerald-200">
                                    <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                      {Number(listing.price).toLocaleString()} tokens
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-600 font-medium">
                              No listings found
                            </div>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-400/10 to-red-500/10 border border-rose-200 text-rose-700">
                          Cancelled
                        </div>
                      </div>
                      <div className="font-medium text-rose-600">
                        Action cancelled
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={message.role === 'user' ? 'text-white/90' : ''}>
                  {typeof message.content === 'string' ? message.content : message.content.text}
                </div>
              )}
            </div>
          )}
        </div>
        
        {message.isAction && message.isPending && (
          <div className="mt-3 sm:mt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleActionConfirmation(true, message.analysis.action, message.timestamp)}
                disabled={completedActions.has(message.timestamp) || isLoading}
                className={`group relative px-4 sm:px-5 py-1.5 sm:py-2 text-white text-xs sm:text-sm font-medium rounded-xl
                transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                disabled:cursor-not-allowed ${
                  completedActions.has(message.timestamp) || isLoading
                    ? 'bg-gray-400/50 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-green-500/20 blur-xl 
                  group-hover:from-emerald-500/30 group-hover:to-green-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative flex items-center gap-1.5">
                  {completedActions.has(message.timestamp) ? (
                    <>
                      <span className="text-lg">✓</span>
                      <span>Confirmed</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">⚡️</span>
                      <span>Confirm</span>
                    </>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleActionConfirmation(false, message.analysis.action, message.timestamp)}
                disabled={completedActions.has(message.timestamp) || isLoading}
                className={`group relative px-4 sm:px-5 py-1.5 sm:py-2 text-white text-xs sm:text-sm font-medium rounded-xl
                transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                disabled:cursor-not-allowed ${
                  completedActions.has(message.timestamp) || isLoading
                    ? 'bg-gray-400/50 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400/20 to-red-500/20 blur-xl 
                  group-hover:from-rose-500/30 group-hover:to-red-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative flex items-center gap-1.5">
                  {completedActions.has(message.timestamp) ? (
                    <>
                      <span className="text-lg">✗</span>
                      <span>Cancelled</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🚫</span>
                      <span>Cancel</span>
                    </>
                  )}
                </div>
              </button>
            </div>
            {!completedActions.has(message.timestamp) && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600/80 font-medium">
                <div className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
                Pending confirmation
              </div>
            )}
          </div>
        )}

        {(!message.isAction || !message.isPending) && (
          <div className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 flex items-center gap-1.5 ${
            message.role === 'user' 
              ? 'text-indigo-200' 
              : message.isAction 
              ? message.isPending
                ? 'text-amber-600'
                : 'text-green-600'
              : 'text-gray-400'
          }`}>
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
            </svg>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 