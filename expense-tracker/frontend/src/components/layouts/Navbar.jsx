import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const { user } = useUser();

  return (
    <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Message */}
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-white">
              Welcome back, <span className="text-indigo-400">{user?.fullName?.split(' ')[0] || 'User'}</span>! 👋
            </h2>
            <p className="text-sm text-slate-400">Here's your financial overview</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'email@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
