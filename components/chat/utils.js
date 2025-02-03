export function transformMessages(messages) {
  const seenActions = new Set();

  return messages.flatMap(msg => {
    const messages = [{
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      isAction: false
    }];

    if (msg.analysis?.actionExecuted && 
        msg.analysis.action.type !== 'None' && 
        !seenActions.has(msg.content)) {
      
      seenActions.add(msg.content);
      let actionMessage = '';

      if (msg.analysis.action.type === 'updateBalance') {
        const amount = msg.analysis.action.data.amount;
        const newBalance = msg.analysis.actionResult?.balance || 0;
        actionMessage = `Balance updated: ${amount > 0 ? '+' : ''}${amount} coins\nNew balance: ${newBalance} coins`;
      } else if (msg.analysis.action.type === 'createListing') {
        actionMessage = `Created listing: ${msg.analysis.action.data.title}\nPrice: ${msg.analysis.action.data.price} coins`;
      } else if (msg.analysis.action.type === 'fetchListings') {
        const result = msg.analysis.actionResult;
        if (result.count === 0) {
          actionMessage = 'No listings found';
        } else {
          actionMessage = `Found ${result.count} listing(s):\n\n${
            result.listings.map(l => 
              `• ${l.title} Price: ${l.price} coins Owner: ${l.owner}`
            ).join('\n')
          }`;
        }
      }

      if (actionMessage) {
        messages.push({
          role: 'system',
          content: actionMessage,
          timestamp: msg.timestamp,
          isAction: true
        });
      }
    }

    return messages;
  });
}

export function formatActionMessage(action, result) {
  if (!action) return null;

  // For pending actions that haven't been executed yet
  if (action.status === 'pending' && !result) {
    switch (action.type) {
      case 'updateBalance':
        return `Pending Action: Add ${action.data.amount} coins to balance`;
      case 'createListing':
        return `Pending Action: Create listing "${action.data.title}" for ${action.data.price} coins`;
      case 'fetchListings':
        return `Pending Action: Fetch ${action.data.type} listings`;
      default:
        return null;
    }
  }

  // For executed/confirmed actions
  if (result) {
    switch (action.type) {
      case 'updateBalance':
        return `Confirmed: Balance updated from ${result.balance - (action.data.amount || 0)} to ${result.balance} coins`;
      case 'createListing':
        return `Confirmed: Created listing "${action.data.title}" for ${action.data.price} coins`;
      case 'fetchListings':
        if (!result.listings?.length) return 'No listings found';
        return `Found ${result.count} listing(s):\n\n${
          result.listings.map(l => 
            `• ${l.title} (${l.price} coins) - ${l.owner}`
          ).join('\n')
        }`;
      default:
        return null;
    }
  }

  return null;
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