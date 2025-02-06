import { useState, useEffect } from 'react';
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
        analysis: {
          action: data.action,
          actionExecuted: !!data.actionResult,
          actionResult: data.actionResult
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
            analysis: {
              action: data.action,
              actionExecuted: !!data.actionResult,
              actionResult: data.actionResult
            }
          });
        }
      }

      setMessages(prev => [...prev, ...newMessages]);
      setLastMessageTimestamp(new Date().getTime());

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

      if (data.actionResult) {
        const actionMessage = formatActionMessage(data.action, data.actionResult);
        if (actionMessage) {
          newMessages.push({
            role: 'system',
            content: actionMessage,
            timestamp: new Date(),
            isAction: true,
            analysis: {
              action: data.action,
              actionExecuted: true,
              actionResult: data.actionResult
            }
          });
        }
      }

      setMessages(prev => [...prev, ...newMessages]);

      if (onMessageSent) {
        await onMessageSent();
      }
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

  return (
    <div className="h-full flex flex-col bg-white shadow-xl sm:rounded-2xl overflow-hidden">
      <div className="flex flex-col h-full">
        <ChatHeader 
          onNewChat={handleNewChat}
          isLoading={isLoading}
          error={error}
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