export default function NavBar({ isLoggedIn, user, onLogout, onLogin }) {
  // Helper function to safely get balance
  const getBalance = () => {
    if (!user) return 0;
    // Handle case where balance is a MongoDB NumberInt
    return user.balance?.$numberInt || user.balance || 0;
  };

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ChatEconomy
        </h1>
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200 shadow-sm">
              <span className="text-gray-500 text-sm mr-2">Tokens:</span>
              <span className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {getBalance()}
              </span>
            </div>
            <div className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-full border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-28 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user.username.toUpperCase()}
              </div>
            
            </div>
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            aria-label="Open authentication modal"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium 
            hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        )}
      </div>
    </header>
  );
} 