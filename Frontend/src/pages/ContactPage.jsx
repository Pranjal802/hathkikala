import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Sparkles, Smartphone } from 'lucide-react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { createWhatsAppUrl, formatSupportWhatsAppMessage } from '../utils/whatsappHelper.js';

export default function ContactPage() {
  const { showNotification } = useStore();

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    subject: 'Custom Order Request',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitSupportTicket(form);
      if (res.success) {
        setSubmittedTicket(form);
        showNotification('Thank you! Your message has been sent to our team 🎉');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-14 px-4 text-center mb-10">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> Get In Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3">Contact & Custom Orders</h1>
          <p className="font-sans text-sm sm:text-base text-rose-100/90 max-w-2xl mx-auto">
            Have a question, bulk gift hamper order, or custom mirror glove design request? Send us a message!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Info Card */}
          <div className="bg-[#3E2C23] text-white p-8 rounded-4xl shadow-lg space-y-8 md:col-span-1 flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#F5E6DA]">Hath Ki Kala Studio</h2>
              <p className="font-sans text-xs text-rose-100/80 leading-relaxed">
                Handmade studio crafting plushies, clutches, slime kits, and tailored artisanal hampers across India.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-[#D8A7B1]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Email Us</span>
                    <span className="font-bold">support@hathkikala.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-[#9CAF88]">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Call / WhatsApp</span>
                    <span className="font-bold">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-[#C97C5D]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Artisan Studio</span>
                    <span className="font-bold">Mumbai, Maharashtra, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl text-[11px] text-rose-100/90 font-medium">
              ✨ Customer Support Hours: <br />
              Mon - Sat: 10:00 AM - 7:00 PM IST
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 sm:p-10 rounded-4xl shadow-sm border border-rose-100 md:col-span-2">
            {submittedTicket ? (
              <div className="text-center py-10 space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-[#3E2C23]">Enquiry Logged Successfully!</h3>
                  <p className="font-sans text-xs text-[#5C4033]/70 max-w-md mx-auto">
                    Thank you! Your message has been saved into our system. You can also chat directly with our team on WhatsApp now for faster response.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={createWhatsAppUrl(formatSupportWhatsAppMessage(submittedTicket))}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
                  >
                    <Smartphone size={16} /> Send Enquiry on WhatsApp 💬
                  </a>

                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setForm({
                        customerName: '',
                        email: '',
                        phone: '',
                        subject: 'Custom Order Request',
                        message: '',
                      });
                    }}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] mb-4">Send Us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aanya Sharma"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      required
                      className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-xl font-sans text-xs font-semibold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="aanya@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-xl font-sans text-xs font-semibold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-xl font-sans text-xs font-semibold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-[#F5E6DA]/50 pl-4 pr-10 py-3 rounded-xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                    >
                      <option value="Custom Order Request">Custom Order Request</option>
                      <option value="Bulk Gift Hampers Inquiry">Bulk Gift Hampers Inquiry</option>
                      <option value="Order Tracking Status">Order Tracking Status</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                    Your Message / Custom Details *
                  </label>
                  <textarea
                    placeholder="Describe your request, preferred colors, quantity, or deadline..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-xl font-sans text-xs font-semibold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-3.5 rounded-2xl font-sans font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {submitting ? 'Submitting Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
