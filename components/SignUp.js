import React, { useState } from 'react';

export default function SignUp({ onToggleForm }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Important for secure cookie handling
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Store only non-sensitive user data
      localStorage.setItem('user', JSON.stringify({
        username: data.user.username,
        email: data.user.email,
        _id: data.user._id
      }));
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Join ChatEconomy
        </h2>
        <p className="text-center text-gray-500">Create your account to start earning with AI</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
              text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 
              focus:ring-2 focus:bg-white transition-colors duration-200"
              placeholder="Choose a unique username"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
              text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 
              focus:ring-2 focus:bg-white transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
              text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 
              focus:ring-2 focus:bg-white transition-colors duration-200"
              placeholder="Create a strong password"
            />
          </div>
        </div>
        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
            text-white font-medium hover:shadow-lg hover:shadow-indigo-500/30 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
            transform transition-all duration-200 hover:-translate-y-0.5
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Already registered?</span>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onToggleForm}
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
        >
          Sign in to your account →
        </button>
      </div>
    </div>
  );
} 