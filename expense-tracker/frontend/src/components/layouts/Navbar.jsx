import { useUser } from '../../context/UserContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useUser();

  return (
    <header className="bg-[#0b0f1a]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      <div className="px-4 lg:px-10 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-white leading-tight">
                Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.fullName?.split(' ')[0] || 'User'}</span>!
              </h2>
              <p className="hidden xs:block text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user?.fullName}</p>
              <p className="text-[10px] text-indigo-400 font-medium mt-1 uppercase">User</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg shadow-indigo-500/10">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;