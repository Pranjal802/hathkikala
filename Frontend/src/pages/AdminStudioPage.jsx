import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import AdminPanel from '../components/admin/AdminPanel.jsx';
import { Lock, Sparkles, ShieldCheck, Eye, EyeOff, LogOut, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';

export default function AdminStudioPage() {
  const { user, login, logout, showNotification, setAdminOpen } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminOpen(true);
    }
  }, [user, setAdminOpen]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const u = await login({ email, password });
      if (u?.role === 'admin') {
        showNotification('Welcome back Admin! Opening Admin Studio ✨');
        setAdminOpen(true);
      } else {
        showNotification('This account does not have Admin privileges', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Admin login failed', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  // If logged in as admin, render dedicated Admin Studio Bar & AdminPanel
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#FFF8F2]">
        {/* Dedicated Admin Header */}
        <header className="bg-[#3E2C23] text-white px-6 py-4 flex items-center justify-between shadow-md border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border border-white/20">
              <img src={logo} alt="Hath Ki Kala" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#F5E6DA] leading-none">हाथ की कला Studio</h1>
              <span className="text-[10px] text-[#D8A7B1] font-mono">Operations & Management Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-rose-100 hover:text-white flex items-center gap-1.5 transition font-medium bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
            >
              Customer Storefront <ExternalLink size={13} />
            </Link>

            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5E6DA]">
              <ShieldCheck size={14} className="text-[#9CAF88]" /> {user.email}
            </div>

            <button
              onClick={logout}
              className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        {/* Full Admin Studio Tabs */}
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <AdminPanel />
        </main>
      </div>
    );
  }

  // Otherwise, render dedicated Standalone Admin Login Form (No customer header!)
  return (
    <div className="bg-[#FFF8F2] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Top Admin Brand Branding */}
      <div className="text-center mb-6 space-y-1">
        <div className="w-16 h-16 bg-gradient-to-br from-[#3E2C23] to-[#5C4033] rounded-3xl flex items-center justify-center mx-auto shadow-md overflow-hidden border border-rose-100">
          <img src={logo} alt="Hath Ki Kala" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#3E2C23]">हाथ की कला Management</h1>
        <p className="font-sans text-xs text-[#5C4033]/70 font-mono">Admin Operations System</p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-4xl shadow-xl border border-rose-100 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#3E2C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock size={22} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-[#C97C5D] block">
            Internal Operations
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#3E2C23]">Admin Studio Portal</h2>
          <p className="font-sans text-xs text-[#5C4033]/70">
            Please enter your administrator credentials to access the store management dashboard.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@hathkikala.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#F5E6DA]/50 pl-4 pr-11 py-3 rounded-xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C4033]/60 hover:text-[#C97C5D] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-[#3E2C23] hover:bg-[#C97C5D] text-white py-3.5 rounded-2xl font-sans font-bold text-xs shadow-md transition"
          >
            {loggingIn ? 'Authenticating...' : 'Sign In to Admin Studio'}
          </button>
        </form>

        <div className="bg-[#F5E6DA]/40 p-3 rounded-2xl text-center text-[11px] text-[#5C4033]/80 font-semibold flex items-center justify-center gap-2">
          <ShieldCheck size={15} className="text-[#C97C5D]" /> Secure SSL Encrypted Administrator Portal
        </div>
      </div>

      <Link to="/" className="mt-6 text-xs font-bold text-[#5C4033]/70 hover:text-[#C97C5D] transition flex items-center gap-1">
        ← Back to Customer Storefront
      </Link>
    </div>
  );
}
