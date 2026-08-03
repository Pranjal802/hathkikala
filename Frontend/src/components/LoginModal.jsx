import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, Heart, ShieldCheck, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '525544862520-i9nt4oigpkl7gmddbe1jimrb306jc541.apps.googleusercontent.com';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, login, signup, googleLogin, verifyOtp, showNotification } = useStore();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'verify-otp'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Initialize Google Sign-In SDK
  useEffect(() => {
    if (!loginOpen || tab === 'verify-otp') return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              if (response.credential) {
                setLoading(true);
                try {
                  await googleLogin(response.credential);
                } catch (err) {
                  showNotification(err.message || 'Google Authentication failed', 'error');
                } finally {
                  setLoading(false);
                }
              }
            },
          });

          const container = document.getElementById('google-signin-container');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: tab === 'login' ? 'signin_with' : 'signup_with',
              shape: 'pill',
            });
          }
        } catch (e) {
          console.warn('Google Auth init note:', e);
        }
      }
    };

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      setTimeout(initGoogle, 100);
    }
  }, [loginOpen, tab, googleLogin, showNotification]);

  if (!loginOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else if (tab === 'register') {
        const res = await signup({
          name: form.name || form.email.split('@')[0],
          email: form.email,
          phone: form.phone,
          password: form.password,
        });

        if (res?.requiresOtp) {
          setUnverifiedEmail(res.email || form.email);
          setTab('verify-otp');
          showNotification(res.message || 'OTP sent to your email!', 'info');
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('unverified')) {
        setUnverifiedEmail(form.email);
        setTab('verify-otp');
        showNotification(err.message, 'info');
      } else {
        showNotification(err.message || 'Authentication failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showNotification('Please enter a valid 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(unverifiedEmail, otpCode);
    } catch (err) {
      showNotification(err.message || 'OTP Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await api.resendOtp(unverifiedEmail);
      showNotification(res.message || `A new OTP has been sent to ${unverifiedEmail}`);
    } catch (err) {
      showNotification(err.message || 'Failed to resend OTP', 'error');
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
                    {tab === 'verify-otp' ? (
                      <ShieldCheck size={24} className="text-white" />
                    ) : (
                      <Sparkles size={22} className="text-white" />
                    )}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                    {tab === 'verify-otp' ? (
                      <>Verify Email OTP ✉️</>
                    ) : tab === 'login' ? (
                      <><Sparkles size={20} /> Welcome Back!</>
                    ) : (
                      <><Heart size={20} className="fill-white" /> Join Our Family</>
                    )}
                  </h2>
                  <p className="font-sans text-xs text-white/90">
                    {tab === 'verify-otp'
                      ? `Code sent to ${unverifiedEmail}`
                      : tab === 'login'
                      ? 'Sign in to access your cart & orders'
                      : 'Create your handmade account'}
                  </p>
                </div>
              </div>

              {/* Tab switcher (Only shown for Login/Register modes) */}
              {tab !== 'verify-otp' && (
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
              )}

              {/* Form Views */}
              {tab === 'verify-otp' ? (
                <form className="px-6 py-6 space-y-4 text-center" onSubmit={handleVerifyOtp}>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      className="w-full bg-[#F5E6DA] text-center tracking-widest text-2xl font-mono py-3.5 rounded-2xl border-2 border-rose-200 text-[#3E2C23] focus:outline-none focus:border-[#C97C5D]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-3.5 rounded-2xl font-sans font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying OTP...' : 'Verify Email & Complete Login'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#C97C5D] font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={13} /> Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  
                  {/* Google Login Section */}
                  <div className="flex flex-col items-center space-y-2 pb-1 border-b border-rose-100">
                    <div id="google-signin-container" className="flex justify-center w-full min-h-[44px]"></div>
                    <div className="relative w-full text-center my-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                      <span className="relative bg-[#FFF8F2] px-3 text-[11px] font-bold text-gray-400 uppercase">or continue with email</span>
                    </div>
                  </div>

                  <form className="space-y-3" onSubmit={handleSubmit}>
                    {tab === 'register' && (
                      <>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8A7B1]" />
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full bg-[#F5E6DA] pl-11 pr-4 py-3 rounded-2xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                          />
                        </div>

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
                      </>
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
                      {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Account & Get OTP'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
