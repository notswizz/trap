import { useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import ChatBot from '@/components/chat/ChatBot';
import SimpleChatBot from '@/components/chat/SimpleChatBot';
import NavBar from '@/components/NavBar';

export default function Home() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMessageSent = async () => {
    // Update unread count or other stats if needed
    setUnreadCount(prev => prev + 1);
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/10">
      <NavBar 
        onShowNotifications={() => setUnreadCount(0)}
        unreadCount={unreadCount}
      />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto">
          {user ? (
            <ChatBot onMessageSent={handleMessageSent} />
          ) : (
            <SimpleChatBot />
          )}
        </div>
      </div>
    </main>
  );
}
