import React, { useState } from 'react';

export default function Logout({ onCancel }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('user');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Are you sure you want to logout?
        </h2>
        <div className="mt-8 space-x-4">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
            rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging out...' : 'Confirm Logout'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium 
            rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 