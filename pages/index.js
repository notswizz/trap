import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Modal from '../components/Modal';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import ChatBot from '../components/chat/ChatBot';
import Typewriter from 'typewriter-effect';
import NavBar from '../components/NavBar';
import HomeContent from '../components/Home';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage for user data on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Fetch latest user data including balance
        fetch('/api/auth/user')
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Memoize the functions for performance optimization
  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);
  const toggleForm = useCallback(() => setIsLogin((prev) => !prev), []);

  // Add this function to fetch latest user data
  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // Add this to make the toggleModal function available to the HomeContent component
  useEffect(() => {
    window.toggleModal = toggleModal;
    return () => {
      delete window.toggleModal;
    };
  }, [toggleModal]);

  const pageTitle = user 
    ? `${user.username} - gptSILK` 
    : "gptSILK - AI-Powered Marketplace";

  const pageDescription = user
    ? "Manage your listings, chat with AI, and trade on gptSILK"
    : "Create and browse listings via AI chat, manage your digital wallet, and trade with confidence.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="gptSILK - AI-Powered Marketplace" />
        <meta property="og:description" content="Create and browse listings via AI chat, manage your digital wallet, and trade with confidence. Your infinite marketplace awaits." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trapchat.vercel.app" /> {/* Replace with your actual domain */}
        <meta property="og:image" content="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Silk_road_Kazakhstan.svg/1200px-Silk_road_Kazakhstan.svg.png" /> {/* Replace with your actual image URL */}
        <meta property="og:site_name" content="gptSILK" />


        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#4F46E5" /> {/* Matches your indigo-600 color */}
        <link rel="icon" href="/favicon.ico" />
        
        
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <NavBar 
          isLoggedIn={!!user} 
          user={user} 
          onLogout={handleLogout}
          onLogin={toggleModal}
        />
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {user ? (
            <ChatBot onMessageSent={refreshUserData} />
          ) : (
            <HomeContent />
          )}
        </main>

        {/* Auth Modal */}
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          {isLogin ? (
            <Login onToggleForm={toggleForm} />
          ) : (
            <SignUp onToggleForm={toggleForm} />
          )}
        </Modal>
      </div>
    </>
  );
}
