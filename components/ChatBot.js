import { useState, useEffect } from 'react';

export default function ChatBot({ onMessageSent }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId]);

  async function fetchConversations() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/conversations', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await res.json();
      setConversations(data.conversations);
      if (data.conversations.length > 0) {
        setCurrentConversationId(data.conversations[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to transform messages
  function transformMessages(messages) {
    // Keep track of seen actions to prevent duplicates
    const seenActions = new Set();

    return messages.flatMap(msg => {
      const messages = [{
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        isAction: false
      }];

      // Only add action message if we haven't seen this exact action before
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

  async function fetchMessages(conversationId) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await res.json();
      setMessages(transformMessages(data.conversation.messages || []));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    }
  }

  async function handleNewChat() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/conversations', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to create new chat');
      }

      const data = await res.json();
      setConversations(prev => [data.conversation, ...prev]);
      setCurrentConversationId(data.conversation._id);
      
      // Set initial welcome message
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your AI assistant. How can I help you today?`,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  }

  // Add this helper function at the top level of the component
  const isDuplicateAction = (newAction, newResult, messages) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Optimized message handling
      const userMessage = { 
        role: 'user', 
        content: input.trim(), // Trim input
        timestamp: new Date() 
      };
      
      // Clear input immediately for better UX
      setInput('');
      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);

      // Send message to API
      const res = await fetch(`/api/chat/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to send message');
      }

      const data = await res.json();

      // Optimize message transformation
      const newMessages = [];
      
      // Add AI response
      newMessages.push({
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        analysis: {
          action: data.action,
          actionExecuted: !!data.actionResult,
          actionResult: data.actionResult
        }
      });

      // Always add action message if there's an action (pending or executed)
      if (data.action && data.action.type !== 'None') {
        const actionMessage = formatActionMessage(
          data.action, 
          data.actionResult
        );
        if (actionMessage) {
          newMessages.push({
            role: 'system',
            content: actionMessage,
            timestamp: new Date(),
            isAction: true,
            isPending: data.action.status === 'pending',
            analysis: {
              action: data.action,
              actionExecuted: !!data.actionResult,
              actionResult: data.actionResult
            }
          });
        }
      }

      setMessages(prev => [...prev, ...newMessages]);

      // Update user data if needed
      if (onMessageSent) {
        await onMessageSent();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the formatActionMessage function
  const formatActionMessage = (action, result) => {
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
  };

  // Update handleActionConfirmation function
  const handleActionConfirmation = async (confirmed, pendingAction, messageId) => {
    if (!currentConversationId) return;

    // Immediately mark this action as completed and clear pending state
    setCompletedActions(prev => new Set(prev).add(messageId));
    setIsLoading(true);

    try {
      const res = await fetch(`/api/chat/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: confirmed ? 'confirm' : 'cancel',
          confirmationResponse: true
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to process confirmation');
      }

      const data = await res.json();
      
      // Add AI response
      const newMessages = [{
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        analysis: data.action ? {
          action: data.action,
          actionExecuted: !!data.actionResult,
          actionResult: data.actionResult
        } : null
      }];

      // Add action result message if needed
      if (data.actionResult) {
        const actionMessage = formatActionMessage(data.action, data.actionResult);
        if (actionMessage) {
          newMessages.push({
            role: 'system',
            content: actionMessage,
            timestamp: new Date(),
            isAction: true
          });
        }
      }

      // Update messages and clear pending action ID
      setMessages(prev => [...prev, ...newMessages]);

      if (onMessageSent) {
        await onMessageSent();
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message);
      // Reset states on error
      setCompletedActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] max-h-[800px] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
          hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 
          flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
                  : message.isAction
                  ? message.isPending
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-800 rounded-none border border-amber-200 shadow-md'
                    : 'bg-gradient-to-r from-emerald-50 to-green-50 text-green-800 rounded-none border border-green-200 shadow-md'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap text-md leading-relaxed">{message.content}</div>
              
              {/* Only show confirmation buttons for pending action messages */}
              {message.isAction && message.isPending && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleActionConfirmation(true, message.analysis.action, message.timestamp)}
                    disabled={completedActions.has(message.timestamp) || isLoading}
                    className={`px-4 py-1.5 text-white text-sm font-medium rounded-full
                    transition-all duration-200 ${
                      completedActions.has(message.timestamp) || isLoading
                        ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-md hover:from-emerald-600 hover:to-green-600'
                    }`}
                  >
                    {completedActions.has(message.timestamp) ? '✓ Confirmed' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => handleActionConfirmation(false, message.analysis.action, message.timestamp)}
                    disabled={completedActions.has(message.timestamp) || isLoading}
                    className={`px-4 py-1.5 text-white text-sm font-medium rounded-full
                    transition-all duration-200 ${
                      completedActions.has(message.timestamp) || isLoading
                        ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-md hover:from-rose-600 hover:to-red-600'
                    }`}
                  >
                    {completedActions.has(message.timestamp) ? '✗ Cancelled' : 'Cancel'}
                  </button>
                </div>
              )}

              <div className={`text-xs mt-2 flex items-center gap-1.5 ${
                message.role === 'user' 
                  ? 'text-indigo-200' 
                  : message.isAction 
                  ? message.isPending
                    ? 'text-amber-600'
                    : 'text-green-600'
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
            <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 text-gray-800 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce delay-100" />
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 text-red-500 rounded-xl px-5 py-3 text-sm border border-red-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-5 py-3 rounded-2xl border border-gray-200/80 bg-white/90 
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent 
              placeholder-gray-400 text-gray-700 text-sm shadow-sm
              disabled:bg-gray-50/90 disabled:cursor-not-allowed transition-all duration-300
              hover:border-indigo-200 hover:shadow-md"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl
            hover:shadow-lg hover:shadow-indigo-500/30 active:shadow-inner
            transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none 
            disabled:hover:transform-none text-sm font-medium min-w-[90px]
            border border-indigo-500/20`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 