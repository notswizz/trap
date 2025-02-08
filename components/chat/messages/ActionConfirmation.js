import React from 'react';

export default function ActionConfirmation({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  const getActionIcon = (type) => {
    switch (type) {
      case 'createListing':
        return '✨';
      case 'buyListing':
        return '🛍️';
      case 'updateBalance':
        return '💰';
      case 'generateImage':
        return '🎨';
      default:
        return '❓';
    }
  };

  const getActionTitle = (type) => {
    switch (type) {
      case 'createListing':
        return 'Create New Listing';
      case 'buyListing':
        return 'Confirm Purchase';
      case 'updateBalance':
        return 'Update Balance';
      case 'generateImage':
        return 'Generate Image';
      default:
        return 'Confirm Action';
    }
  };

  const getActionDescription = (action) => {
    if (!action || !action.type) {
      return 'Invalid action data';
    }

    try {
      const data = action.data || {};
      
      switch (action.type) {
        case 'createListing':
          return `Create listing "${data.title || 'Untitled'}" for ${data.price || 0} tokens`;
        case 'buyListing':
          return `Purchase "${data.query || data.title || 'item'}" for ${data.price || 0} tokens`;
        case 'updateBalance':
          const amount = data.amount || 0;
          return amount > 0 
            ? `Add ${amount} tokens to your balance`
            : `Remove ${Math.abs(amount)} tokens from your balance`;
        case 'generateImage':
          return `Generate image: "${data.prompt || 'No prompt provided'}"`;
        default:
          return 'Please confirm this action';
      }
    } catch (error) {
      console.error('Error formatting action description:', error);
      return 'Error displaying action details';
    }
  };

  // Safely get action data
  const action = message?.analysis?.action;
  if (!action || !action.type) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg">
          {getActionIcon(action.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {getActionTitle(action.type)}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {getActionDescription(action)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleActionConfirmation(true, action, message.timestamp)}
              disabled={completedActions.has(message.timestamp) || isLoading}
              className={`group relative px-4 py-2 text-white text-sm font-medium rounded-lg
              transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              disabled:cursor-not-allowed ${
                completedActions.has(message.timestamp) || isLoading
                  ? 'bg-gray-400/50 backdrop-blur-sm'
                  : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600'
              }`}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-green-500/20 blur-xl 
                group-hover:from-emerald-500/30 group-hover:to-green-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center gap-1.5">
                {completedActions.has(message.timestamp) ? (
                  <>
                    <span>✓</span>
                    <span>Confirmed</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Confirm</span>
                  </>
                )}
              </div>
            </button>
            <button
              onClick={() => handleActionConfirmation(false, action, message.timestamp)}
              disabled={completedActions.has(message.timestamp) || isLoading}
              className={`group relative px-4 py-2 text-gray-700 text-sm font-medium rounded-lg
              transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300
              hover:from-gray-200 hover:to-gray-100`}
            >
              <div className="relative flex items-center gap-1.5">
                {completedActions.has(message.timestamp) ? (
                  <>
                    <span>✕</span>
                    <span>Cancelled</span>
                  </>
                ) : (
                  <>
                    <span>✕</span>
                    <span>Cancel</span>
                  </>
                )}
              </div>
            </button>
          </div>
          {!completedActions.has(message.timestamp) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-2">
              <div className="h-1 w-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse" />
              Pending confirmation
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 