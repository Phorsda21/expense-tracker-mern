import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(formData.fullName, formData.email, formData.password);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex font-sans selection:bg-indigo-500/30">
      {/* Left Side - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0b0f1a] items-center justify-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-3xl">$</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Expense<span className="text-indigo-400">Tracker</span></h1>
          </div>
          <div className="space-y-8">
            <h2 className="text-6xl font-extrabold text-white leading-[1.1]">Start your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">new journey.</span></h2>
            <p className="text-slate-400 text-xl leading-relaxed">Join to manage your finances effortlessly.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 bg-[#0b0f1a] lg:bg-slate-900/20 backdrop-blur-sm">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible only on Mobile) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
              <span className="text-white font-bold text-2xl">₹</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Expense<span className="text-indigo-400">Tracker</span></h1>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Sign up to start tracking your finances</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Enter a strong password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Confirm</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 mt-6">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 decoration-indigo-400/30">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;