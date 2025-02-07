import { useState, useEffect, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { transformMessages, formatActionMessage, isDuplicateAction } from './utils';

export default function ChatBot({ onMessageSent }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  useEffect(() => {
    handleNewChat();  // Create a new chat immediately on mount
  }, []);

  useEffect(() => {
    if (currentConversationId && !isLoading) {
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
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
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
      setInput(''); // Clear input when starting new chat
      setError(null); // Clear any errors
      setCompletedActions(new Set()); // Reset completed actions
      setLastMessageTimestamp(null); // Reset timestamp
      
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
      setMessages(transformMessages(data.conversation.messages));
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  }

  // Clear input on component mount/refresh
  useEffect(() => {
    setInput('');
  }, []);

  // Function to trigger stats update
  const triggerStatsUpdate = useCallback(async () => {
    setStatsUpdateTrigger(prev => prev + 1);
    if (onMessageSent) {
      await onMessageSent();
    }
  }, [onMessageSent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const userMessage = { 
        role: 'user', 
        content: input.trim(),
        timestamp: new Date() 
      };
      
      setInput('');
      setMessages(prev => [...prev, userMessage]);

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
      const newMessages = [];
      
      newMessages.push({
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        user: data.user,
        analysis: {
          action: data.action,
          actionExecuted: !!data.actionResult,
          actionResult: data.actionResult,
          user: data.user
        }
      });

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
            user: data.user,
            analysis: {
              action: data.action,
              actionExecuted: !!data.actionResult,
              actionResult: data.actionResult,
              user: data.user
            }
          });
        }
      }

      setMessages(prev => [...prev, ...newMessages]);
      setLastMessageTimestamp(new Date().getTime());

      // Trigger stats update after message
      await triggerStatsUpdate();
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

  const handleActionConfirmation = async (confirmed, pendingAction, messageId) => {
    if (!currentConversationId) return;

    setCompletedActions(prev => new Set(prev).add(messageId));
    setIsLoading(true);

    try {
      // Find the original message with the pending action
      const originalMessage = messages.find(m => m.timestamp === messageId);
      const actionToConfirm = originalMessage?.analysis?.action || pendingAction;

      console.log('Confirming action:', {
        confirmed,
        action: actionToConfirm,
        messageId
      });

      const res = await fetch(`/api/chat/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: confirmed ? 'confirm' : 'cancel',
          confirmationResponse: true,
          pendingAction: actionToConfirm
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to process confirmation');
      }

      const data = await res.json();
      
      // Update the original message to show it's been handled
      setMessages(prev => prev.map(msg => 
        msg.timestamp === messageId
          ? {
              ...msg,
              analysis: {
                ...msg.analysis,
                action: {
                  ...msg.analysis.action,
                  status: confirmed ? 'completed' : 'cancelled'
                }
              }
            }
          : msg
      ));

      // Only add the response message if it's not an error
      if (!data.error) {
        const newMessages = [{
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          user: data.user,
          analysis: data.action ? {
            action: data.action,
            actionExecuted: !!data.actionResult,
            actionResult: data.actionResult,
            user: data.user
          } : null
        }];

        if (data.actionResult && confirmed) {
          const actionMessage = formatActionMessage(data.action, data.actionResult);
          if (actionMessage) {
            newMessages.push({
              role: 'system',
              content: actionMessage,
              timestamp: new Date(),
              isAction: true,
              isConfirmed: true,
              user: data.user,
              analysis: {
                action: data.action,
                actionExecuted: true,
                actionResult: data.actionResult,
                user: data.user
              }
            });
          }
        }

        setMessages(prev => [...prev, ...newMessages]);
      }

      // Trigger stats update after action
      await triggerStatsUpdate();
      // Add a small delay and update again to ensure we catch all changes
      setTimeout(triggerStatsUpdate, 1000);

    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
        isError: true
      }]);
      setCompletedActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add handleStatClick function
  const handleStatClick = (message) => {
    setInput(message);
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl sm:rounded-2xl overflow-hidden">
      <div className="flex flex-col h-full">
        <ChatHeader 
          onNewChat={handleNewChat}
          statsUpdateTrigger={statsUpdateTrigger}
          isLoading={isLoading}
          error={error}
          onStatClick={handleStatClick}
        />
        
        <ChatMessages 
          messages={messages}
          onActionConfirmation={handleActionConfirmation}
          completedActions={completedActions}
          lastMessageTimestamp={lastMessageTimestamp}
          isLoading={isLoading}
        />
        
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          isNewConversation={messages.length <= 1}
        />
      </div>
    </div>
  );
} 