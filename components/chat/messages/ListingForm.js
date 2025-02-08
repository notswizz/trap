import React, { useState, useEffect } from 'react';

export default function ListingForm({ 
  message, 
  handleActionConfirmation, 
  completedActions, 
  isLoading 
}) {
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    if (message.analysis?.action?.type === 'createListing' && message.analysis?.action?.data) {
      setListingForm({
        title: message.analysis.action.data.title || '',
        description: message.analysis.action.data.description || '',
        price: message.analysis.action.data.price || ''
      });
    }
  }, [message.analysis?.action]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setListingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleListingSubmit = (e) => {
    e.preventDefault();
    const action = {
      ...message.analysis.action,
      data: {
        ...message.analysis.action.data,
        ...listingForm
      }
    };
    handleActionConfirmation(true, action, message.timestamp);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full 
        bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg">
        ✨
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Create New Listing
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Review and confirm your listing details
        </p>
        
        <form onSubmit={handleListingSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={listingForm.title}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={listingForm.description}
              onChange={handleFormChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (tokens)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={listingForm.price}
              onChange={handleFormChange}
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative px-4 py-2 text-white text-sm font-medium rounded-lg
              transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              disabled:cursor-not-allowed ${
                isLoading
                  ? 'bg-gray-400/50 backdrop-blur-sm'
                  : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600'
              }`}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-green-500/20 blur-xl 
                group-hover:from-emerald-500/30 group-hover:to-green-600/30 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center gap-1.5">
                <span>✨</span>
                <span>Create Listing</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleActionConfirmation(false, message.analysis.action, message.timestamp)}
              disabled={isLoading}
              className="group relative px-4 py-2 text-gray-700 text-sm font-medium rounded-lg
              transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300
              hover:from-gray-200 hover:to-gray-100"
            >
              <div className="relative flex items-center gap-1.5">
                <span>✕</span>
                <span>Cancel</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-2">
            <div className="h-1 w-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse" />
            <span>The AI-generated image will be created after you confirm</span>
          </div>
        </form>
      </div>
    </div>
  );
} 