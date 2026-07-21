import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, Heart, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, login, signup, showNotification } = useStore();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
  });

  if (!loginOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await signup({
          name: form.name || form.email.split('@')[0],
          email: form.email,
          phone: form.phone || '9876543210',
          password: form.password,
        });
      }
    } catch (err) {
      showNotification(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginOpen(false)}
            className="fixed inset-0 bg-[#3E2C23]/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#FFF8F2] rounded-4xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] p-7 text-center overflow-hidden">
                <button
                  id="login-close-btn"
                  onClick={() => setLoginOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-all"
                >
                  <X size={15} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Sparkles size={22} className="text-white" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                    {tab === 'login' ? (
                      <><Sparkles size={20} /> Welcome Back!</>
                    ) : (
                      <><Heart size={20} className="fill-white" /> Join Our Family</>
                    )}
                  </h2>
                  <p className="font-sans text-xs text-white/90">
                    {tab === 'login' ? 'Sign in to access your cart & orders' : 'Create your handmade account'}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex mx-6 mt-4 bg-[#F5E6DA] rounded-2xl p-1">
                {[['login', 'Sign In'], ['register', 'Register']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTab(val)}
                    className={`flex-1 py-2 rounded-xl font-sans text-xs font-bold transition-all duration-300 ${
                      tab === val
                        ? 'bg-white text-[#C97C5D] shadow-sm'
                        : 'text-[#5C4033]/60 hover:text-[#5C4033]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form className="px-6 py-5 space-y-3" onSubmit={handleSubmit}>
                {tab === 'register' && (
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="w-full bg-[#F5E6DA] pl-11 pr-4 py-3 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full bg-[#F5E6DA] pl-11 pr-4 py-3 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full bg-[#F5E6DA] pl-11 pr-11 py-3 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D8A7B1] hover:text-[#C97C5D] transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-3.5 rounded-2xl font-sans font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
