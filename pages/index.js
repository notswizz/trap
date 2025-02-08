import { useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import ChatBot from '@/components/chat/ChatBot';
import SimpleChatBot from '@/components/chat/SimpleChatBot';
import NavBar from '@/components/NavBar';
import Head from 'next/head';

export default function Home() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMessageSent = async () => {
    // Update unread count or other stats if needed
    setUnreadCount(prev => prev + 1);
  };

  return (
    <>
      <Head>
        <title>gptSILK - Infinite AI Economy</title>
        <meta name="description" content="Trade AI models, manage digital assets, and shape the future of AI commerce in our infinite economy." />
        <meta property="og:title" content="gptSILK - Infinite AI Economy" />
        <meta property="og:description" content="Access unlimited AI models, trade digital assets seamlessly, and join a growing community of traders in the new digital economy." />
        <meta property="og:image" content="/gptsilk.png" />
        <meta property="og:url" content="https://gptsilk.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="gptSILK - Infinite AI Economy" />
        <meta name="twitter:description" content="Trade AI models, manage digital assets, and shape the future of AI commerce in our infinite economy." />
        <meta name="twitter:image" content="/gptsilk.png" />
      </Head>

      <main className="fixed inset-0 flex flex-col bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/10">
        <NavBar 
          onShowNotifications={() => setUnreadCount(0)}
          unreadCount={unreadCount}
        />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="h-full max-w-7xl mx-auto">
            {user ? (
              <ChatBot onMessageSent={handleMessageSent} />
            ) : (
              <SimpleChatBot />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
