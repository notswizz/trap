import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Modal from '../components/Modal';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import ChatBot from '../components/ChatBot';
import Typewriter from 'typewriter-effect';
import NavBar from '../components/NavBar';

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

  return (
    <>
      <Head>
        <title>ChatEconomy - Chat with the Future</title>
        <meta
          name="description"
          content="Join ChatEconomy, where extraordinary ideas take form. Connect, chat, and innovate."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-64 h-64 bg-purple-600 rounded-full filter blur-3xl"></div>
                  <div className="w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl -ml-20"></div>
                </div>
                <h2 className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold">
                  <Typewriter
                    options={{
                      strings: [
                        'Build Something Extraordinary',
                        'Innovate, Chat, Create',
                        'Discover New Possibilities'
                      ],
                      autoStart: true,
                      loop: true,
                      delay: 75,
                    }}
                  />
                </h2>
              </div>
              <p className="mt-6 max-w-md mx-auto text-xl text-gray-600 md:text-2xl md:max-w-3xl">
                Join our community of creators and innovators.
              </p>
              <div className="flex justify-center gap-4 pt-8">
                <button
                  onClick={toggleModal}
                  className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium 
                  hover:shadow-xl hover:shadow-gray-900/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
                <button
                  className="px-8 py-3 rounded-full bg-white text-gray-900 font-medium border border-gray-200
                  hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Learn More
                </button>
              </div>
            </div>
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
