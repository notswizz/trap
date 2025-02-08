export function transformMessages(messages = []) {
  try {
    const seenActions = new Set();

    return messages.flatMap(msg => {
      if (!msg) return [];  // Skip null/undefined messages
      
      const messages = [{
        role: msg.role || 'user',  // Default to user if role is missing
        content: msg.content || '',  // Default to empty string if content is missing
        timestamp: msg.timestamp || new Date(),  // Default to now if timestamp is missing
        isWelcome: msg.isWelcome || false,
        isAction: false
      }];

      if (msg.analysis?.actionExecuted && 
          msg.analysis.action?.type !== 'None' && 
          !seenActions.has(msg.content)) {
        
        try {
          seenActions.add(msg.content);
          let actionMessage = '';

          if (msg.analysis.action.type === 'updateBalance') {
            const amount = msg.analysis.action.data?.amount || 0;
            const newBalance = msg.analysis.actionResult?.balance || 0;
            actionMessage = `Balance updated: ${amount > 0 ? '+' : ''}${amount} tokens\nNew balance: ${newBalance} tokens`;
          } else if (msg.analysis.action.type === 'createListing') {
            actionMessage = `Created listing: ${msg.analysis.action.data?.title || 'Untitled'}\nPrice: ${msg.analysis.action.data?.price || 0} tokens`;
          } else if (msg.analysis.action.type === 'fetchListings') {
            const result = msg.analysis.actionResult;
            if (!result?.listings?.length) {
              actionMessage = 'No listings found';
            } else {
              actionMessage = `Found ${result.count || 0} listing(s):\n\n${
                result.listings.map(l => 
                  `• ${l.title || 'Untitled'} (${l.price || 0} tokens) Owner: ${l.currentOwnerUsername || 'Unknown'} Creator: ${l.creatorUsername || 'Unknown'}`
                ).join('\n')
              }`;
            }
          }

          if (actionMessage) {
            messages.push({
              role: 'system',
              content: actionMessage,
              timestamp: msg.timestamp || new Date(),
              isAction: true
            });
          }
        } catch (error) {
          console.error('Error processing action message:', error);
          // Continue without adding the action message
        }
      }

      return messages;
    });
  } catch (error) {
    console.error('Error transforming messages:', error);
    return []; // Return empty array on error
  }
}

export function formatActionMessage(action, result) {
  try {
    if (!action) return null;

    // For pending actions that haven't been executed yet
    if (action.status === 'pending' && !result) {
      switch (action.type) {
        case 'updateBalance':
          return `Pending Action: Add ${action.data?.amount || 0} tokens to balance`;
        case 'createListing':
          return `Pending Action: Create listing "${action.data?.title || 'Untitled'}" for ${action.data?.price || 0} tokens`;
        case 'fetchListings':
          return `Pending Action: Fetch ${action.data?.type || 'all'} listings`;
        case 'buyListing':
          return `Pending Action: Purchase ${action.data?.listingId || 'unknown'} for ${action.data?.price || 0} tokens`;
        default:
          return null;
      }
    }

    // For executed/confirmed actions
    if (result) {
      switch (action.type) {
        case 'updateBalance':
          return `Confirmed: Balance updated from ${(result.balance || 0) - (action.data?.amount || 0)} to ${result.balance || 0} tokens`;
        case 'createListing':
          return `Confirmed: Created listing "${action.data?.title || 'Untitled'}" for ${action.data?.price || 0} tokens`;
        case 'fetchListings':
          if (!result.listings?.length) return 'No listings found';
          return `Found ${result.count || 0} listing(s):\n\n${
            result.listings.map(l => 
              `• ${l.title || 'Untitled'} (${l.price || 0} tokens) - ${l.owner || 'Unknown'}`
            ).join('\n')
          }`;
        case 'buyListing':
          return `Confirmed: Purchased ${action.data?.listingId || 'unknown'} for ${action.data?.price || 0} tokens`;
        default:
          return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error formatting action message:', error);
    return null;
  }
}

export function isDuplicateAction(newAction, newResult, messages) {
  // Get the last action message
  const lastActionMessage = messages
    .filter(m => m.analysis?.actionExecuted)
    .pop();

  if (!lastActionMessage) return false;

  const lastAction = lastActionMessage.analysis.action;
  const lastResult = lastActionMessage.analysis.actionResult;
  const lastTime = new Date(lastActionMessage.timestamp).getTime();
  const currentTime = new Date().getTime();

  // If actions are within 2 seconds of each other
  const timeDiff = currentTime - lastTime;
  if (timeDiff < 2000) {
    // For balance updates, check if it's the same amount
    if (newAction.type === 'updateBalance' && lastAction.type === 'updateBalance') {
      return newAction.data.amount === lastAction.data.amount;
    }
    
    // For listings, check if it's the same title and price
    if (newAction.type === 'createListing' && lastAction.type === 'createListing') {
      return newAction.data.title === lastAction.data.title && 
             newAction.data.price === lastAction.data.price;
    }

    // For fetching listings, prevent duplicate fetches
    if (newAction.type === 'fetchListings' && lastAction.type === 'fetchListings') {
      return newAction.data.type === lastAction.data.type;
    }
  }

  return false;
} 