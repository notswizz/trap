import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "👋 Welcome! Please enter your username to get started.",
  timestamp: new Date()
};

const MESSAGES = {
  welcome: "👋 Welcome! Please enter your username to get started.",
  enterPassword: "Great! Please enter your password to log in.",
  createPassword: "This username is available! Please create a password for your new account. It must be at least 8 characters long.",
  invalidPassword: "Invalid password. Please try again.",
  error: "Something went wrong. Please try again.",
  success: "🎉 Success! Logging you in..."
};

export default function ChatAuthBot({ onClose }) {
  const { login, signup } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [awaitingPassword, setAwaitingPassword] = useState(false);
  const [awaitingNewPassword, setAwaitingNewPassword] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, role = 'assistant') => {
    if (typeof content === 'string') {
      setMessages(prev => [...prev, {
        role,
        content,
        timestamp: new Date()
      }]);
    } else {
      // Handle action messages
      setMessages(prev => [...prev, {
        ...content,
        timestamp: new Date()
      }]);
    }
  };

  const handleCreateAccount = () => {
    // Prefill and auto-submit the confirmation message
    setInput('Yes, I want to create an account');
    const fakeEvent = { preventDefault: () => {} };
    handleSubmit(fakeEvent, true).then(() => {
      // After the message is sent, show password prompt
      addMessage(MESSAGES.createPassword);
      setAwaitingNewPassword(true);
      setInput(''); // Clear input for password
    });
  };

  const handleTryAgain = () => {
    // Prefill and auto-submit the try again message
    setInput('No, let me try a different username');
    const fakeEvent = { preventDefault: () => {} };
    handleSubmit(fakeEvent, true).then(() => {
      // After the message is sent, reset states
      addMessage(MESSAGES.welcome);
      setUsername('');
      setAwaitingPassword(false);
      setAwaitingNewPassword(false);
      setInput(''); // Clear input for new username
    });
  };

  const handleUsernameCheck = async (username) => {
    try {
      const res = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      
      if (data.exists) {
        addMessage(MESSAGES.enterPassword);
        setAwaitingPassword(true);
      } else {
        // Directly go to password creation
        addMessage(MESSAGES.createPassword);
        setAwaitingNewPassword(true);
      }
    } catch (error) {
      console.error('Username check error:', error);
      addMessage(MESSAGES.error);
      setUsername('');
      setAwaitingPassword(false);
      setAwaitingNewPassword(false);
    }
  };

  const handleLogin = async (password) => {
    try {
      const success = await login(username, password);

      if (!success) {
        throw new Error('Invalid credentials');
      }

      addMessage(MESSAGES.success);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      addMessage(MESSAGES.invalidPassword);
      setAwaitingPassword(true); // Allow retry
    }
  };

  const handleSignup = async (password) => {
    try {
      const success = await signup(username, password);

      if (!success) {
        throw new Error('Failed to create account');
      }

      addMessage(MESSAGES.success);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
      addMessage(error.message);
      setAwaitingNewPassword(false);
      setUsername('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage(userInput, 'user');

    try {
      if (awaitingPassword) {
        await handleLogin(userInput);
      } else if (awaitingNewPassword) {
        await handleSignup(userInput);
      } else {
        setUsername(userInput);
        await handleUsernameCheck(userInput);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[500px] w-full max-w-3xl mx-auto flex flex-col 
      bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 
      rounded-2xl shadow-xl shadow-purple-500/10 overflow-hidden 
      border border-purple-200/30 backdrop-blur-lg">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200/50 scrollbar-track-transparent">
          <div className="min-h-full p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg relative overflow-hidden
                    transform transition-transform duration-300 hover:scale-[1.02] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white/90 border border-purple-100/30 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className={`absolute inset-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                      : 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50'
                  } opacity-0 hover:opacity-100 transition-opacity duration-300`}/>
                  
                  {message.isAction ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px] relative z-10">
                        {message.content}
                      </p>
                      <div className="flex gap-2">
                        {message.actionButtons?.map((button, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={button.onClick}
                            className="px-4 py-2 bg-white text-purple-600 rounded-lg shadow-md
                              hover:shadow-lg transition-all duration-200 text-sm font-medium
                              hover:-translate-y-0.5 active:translate-y-0"
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px] relative z-10">
                      {message.content}
                    </p>
                  )}
                  
                  <div className={`text-xs mt-2 flex items-center gap-1.5 relative z-10 ${
                    message.role === 'user' 
                      ? 'text-indigo-200'
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
                <div className="bg-white/90 border border-purple-100/30 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 animate-bounce shadow-sm" />
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 animate-bounce [animation-delay:0.2s] shadow-sm" />
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 animate-bounce [animation-delay:0.4s] shadow-sm" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-purple-100/30">
        <div className="relative">
          <input
            type={awaitingPassword || awaitingNewPassword ? 'password' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              awaitingPassword ? "Enter your password..." :
              awaitingNewPassword ? "Create your password..." :
              "Enter your username..."
            }
            className="w-full px-4 py-3 rounded-xl border border-purple-200/30 
              bg-white/80 backdrop-blur-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              pr-12"
            disabled={isLoading || input === 'Yes, I want to create an account' || input === 'No, let me try a different username'}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2
              p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500
              text-white opacity-90 hover:opacity-100 disabled:opacity-50
              transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 