import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, Heart, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function LoginModal() {
  const { loginOpen, setLoginOpen } = useStore();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);

  return (
    <AnimatePresence>
      {loginOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginOpen(false)}
            className="fixed inset-0 bg-[#3E2C23]/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#FFF8F2] rounded-4xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] p-8 text-center overflow-hidden">
                <div className="absolute -top-8 -left-8 w-28 h-28 bg-white/10 blob" />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 blob" />
                <button
                  id="login-close-btn"
                  onClick={() => setLoginOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-all"
                >
                  <X size={15} />
                </button>
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                    {tab === 'login' ? (
                      <><Sparkles size={20} /> Welcome Back!</>
                    ) : (
                      <><Heart size={20} className="fill-white" /> Join Our Family</>
                    )}
                  </h2>
                  <p className="font-sans text-sm text-white/80">
                    {tab === 'login' ? 'Sign in to your account' : 'Create your handmade account'}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex mx-6 mt-6 bg-[#F5E6DA] rounded-2xl p-1">
                {[['login', 'Sign In'], ['register', 'Register']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTab(val)}
                    className={`flex-1 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all duration-300 ${
                      tab === val
                        ? 'bg-white text-[#C97C5D] shadow-soft'
                        : 'text-[#5C4033]/60 hover:text-[#5C4033]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form
                className="px-6 py-6 space-y-4"
                onSubmit={e => { e.preventDefault(); setLoginOpen(false); }}
              >
                {tab === 'register' && (
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                    <input
                      id="register-name"
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-[#F5E6DA] pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="Email address"
                    className="w-full bg-[#F5E6DA] pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full bg-[#F5E6DA] pl-11 pr-11 py-3.5 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D8A7B1] hover:text-[#C97C5D] transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {tab === 'login' && (
                  <div className="text-right">
                    <a href="#" className="font-sans text-xs text-[#C97C5D] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-4 rounded-2xl font-sans font-semibold shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all"
                >
                  {tab === 'login' ? (
                    <span className="flex items-center justify-center gap-2"><Sparkles size={16} /> Sign In</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Heart size={16} className="fill-white" /> Create Account</span>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#F5E6DA]" />
                  <span className="font-sans text-xs text-[#5C4033]/40">or continue with</span>
                  <div className="flex-1 h-px bg-[#F5E6DA]" />
                </div>

                {/* Google sign in */}
                <button
                  type="button"
                  className="w-full border-2 border-[#F5E6DA] text-[#3E2C23] py-3.5 rounded-2xl font-sans text-sm font-medium flex items-center justify-center gap-3 hover:border-[#D8A7B1] hover:bg-[#FFF0F5] transition-all"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Globe size={18} className="text-[#6B8E7F]" />
                  </div>
                  Continue with Google
                </button>
              </form>

              <p className="text-center font-sans text-xs text-[#5C4033]/50 pb-6 px-6">
                By continuing, you agree to our{' '}
                <a href="#" className="text-[#C97C5D] hover:underline">Terms</a> &{' '}
                <a href="#" className="text-[#C97C5D] hover:underline">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
