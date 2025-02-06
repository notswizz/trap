export default function NavBar({ isLoggedIn, user, onLogout, onLogin }) {
  // Helper function to safely get balance
  const getBalance = () => {
    if (!user) return 0;
    // Handle case where balance is a MongoDB NumberInt
    return user.balance?.$numberInt || user.balance || 0;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <a href="/" 
           onClick={(e) => { e.preventDefault(); window.location.reload(); }}
           className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <h1 className="text-lg sm:text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent font-black">
              gpt
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-black">
              SILK
            </span>
          </h1>
          <div className="h-4 sm:h-6 w-px bg-gradient-to-b from-purple-200 to-emerald-200" />
          <p className="flex items-center text-[9px] sm:text-xs font-medium tracking-wide
            bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400 
            bg-clip-text text-transparent uppercase gap-0.5 sm:gap-1">
            <span className="text-sm sm:text-base">∞</span> 
            <span>infinite AI economy</span>
          </p>
        </a>

        {user ? (
          <button
            onClick={handleLogout}
            className="group flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-purple-100/80 to-emerald-100/80 
              rounded-full border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300 
              hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-28 h-8 rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 
              flex items-center justify-center text-white text-sm font-bold group-hover:from-red-500 
              group-hover:to-pink-500 transition-all duration-300">
              {user.username.toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            onClick={onLogin}
            aria-label="Open authentication modal" 
            className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 text-white text-sm sm:text-base font-medium
            hover:shadow-xl hover:shadow-emerald-500/20
            active:shadow-md active:translate-y-0.5 
            transition-all duration-300 transform hover:-translate-y-1
            border border-purple-400/30 backdrop-blur-sm
            flex items-center gap-2"
          >
            <span>👋</span>
            Login
          </button>
        )}
      </div>
    </header>
  );
} 