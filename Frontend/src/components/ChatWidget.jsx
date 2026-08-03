import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { MessageCircle, X, Send, Sparkles, HelpCircle, ChevronRight, RotateCcw, Smartphone, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Orders & Delivery',
  'Customization',
  'Pricing & Payment',
  'Product & Stock',
  'Returns & Support',
];

const WHATSAPP_NUMBER = '919313729507';

export default function ChatWidget() {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [settings, setSettings] = useState({ chatWidgetEnabled: true, proactiveNudgeEnabled: true, proactiveNudgeDelaySeconds: 8 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('hathkikala_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch FAQ questions & settings
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await api.getChatQuestions();
        if (res.success && res.data) {
          setQuestions(res.data.questions || []);
          setGroupedQuestions(res.data.grouped || {});
          if (res.data.settings) setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to load chat FAQ:', err);
      }
    };
    fetchFAQ();
  }, []);

  // Proactive Nudge Timer
  useEffect(() => {
    if (settings.proactiveNudgeEnabled && !isOpen) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, (settings.proactiveNudgeDelaySeconds || 8) * 1000);
      return () => clearTimeout(timer);
    }
  }, [settings, isOpen]);

  // Persist Messages in Session Storage
  useEffect(() => {
    try {
      sessionStorage.setItem('hathkikala_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!settings.chatWidgetEnabled) return null;

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowNudge(false);
  };

  const handleTapQuestion = (qObj) => {
    const userMsg = { id: Date.now(), sender: 'user', text: qObj.question };
    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: qObj.answer,
      category: qObj.category,
      related: questions.filter((item) => item.category === qObj.category && item._id !== qObj._id).slice(0, 2),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSendFreeText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      // Check if text closely matches a predefined question
      const matched = questions.find(
        (q) => q.question.toLowerCase().includes(userQuery.toLowerCase()) || userQuery.toLowerCase().includes(q.question.toLowerCase())
      );

      if (matched) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: matched.answer,
          category: matched.category,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Log as unanswered question
        await api.askUnansweredQuestion({
          questionText: userQuery,
          customerName: user?.name,
          customerPhone: user?.phone,
          customerEmail: user?.email,
        });

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Thank you for reaching out! We've received your query and logged it for our artisan support team. You can also chat with us directly on WhatsApp for real-time assistance.",
          showWhatsAppLink: true,
          waQuery: userQuery,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "We've logged your question! Feel free to contact us directly on WhatsApp.",
        showWhatsAppLink: true,
        waQuery: userQuery,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const filteredQuestions =
    selectedCategory === 'All'
      ? questions
      : questions.filter((q) => q.category === selectedCategory);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* Proactive Nudge Bubble */}
      {showNudge && !isOpen && (
        <div className="mb-3 bg-white text-[#3E2C23] p-3.5 rounded-2xl shadow-xl border border-rose-200 text-xs font-bold flex items-center gap-2 animate-bounce max-w-xs">
          <Sparkles className="w-4 h-4 text-[#C97C5D] shrink-0" />
          <span>Need help with an order or customization? Chat with us! 💬</span>
          <button
            onClick={() => setShowNudge(false)}
            className="text-gray-400 hover:text-gray-600 ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-96 h-[520px] bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] p-4 text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                🌸
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold leading-tight">Hath Ki Kala Support</h4>
                <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Artisan FAQ Help
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([])}
                className="p-1.5 hover:bg-white/20 rounded-full text-white/80 transition"
                title="Clear Chat History"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages & FAQ Body Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFF8F2]/60 custom-scrollbar">
            
            {/* Starter Banner */}
            <div className="bg-white p-3 rounded-2xl border border-rose-100 text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-extrabold text-[#C97C5D] uppercase tracking-wider">
                Instant Quick FAQ Guide
              </span>
              <p className="text-xs font-semibold text-gray-700">
                Tap any question below for immediate answers, or type a custom message!
              </p>
            </div>

            {/* Render Chat Messages trajectory if customer started chatting */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#C97C5D] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-gray-800 border border-rose-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}

                  {/* Direct WhatsApp Forward Button */}
                  {msg.showWhatsAppLink && (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg.waQuery || 'Hello Hath Ki Kala')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow transition"
                    >
                      <Smartphone size={13} /> Chat on WhatsApp Now
                    </a>
                  )}
                </div>

                {/* Contextual Follow-up recommendations */}
                {msg.related && msg.related.length > 0 && (
                  <div className="pl-2 space-y-1 mt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Related Questions:</span>
                    {msg.related.map((relQ) => (
                      <button
                        key={relQ._id}
                        onClick={() => handleTapQuestion(relQ)}
                        className="block text-left text-[11px] text-[#C97C5D] font-bold hover:underline bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100"
                      >
                        • {relQ.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />

            {/* PREDEFINED STARTER QUESTIONS LIST (Always visible by default) */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle size={13} className="text-[#C97C5D]" /> Frequent Questions
                </span>
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="text-[10px] text-[#C97C5D] font-bold hover:underline"
                  >
                    See all questions
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition border ${
                      selectedCategory === cat
                        ? 'bg-[#C97C5D] text-white border-[#C97C5D]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Starter Question Pills */}
              <div className="space-y-1.5">
                {filteredQuestions.map((q) => (
                  <button
                    key={q._id || q.question}
                    onClick={() => handleTapQuestion(q)}
                    className="w-full text-left p-2.5 bg-white hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-2xl text-xs font-semibold text-gray-800 transition flex items-center justify-between group shadow-sm"
                  >
                    <span className="flex items-center gap-1.5">
                      {q.isFeatured && <span className="text-amber-500 text-[10px]">⭐</span>}
                      {q.question}
                    </span>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-[#C97C5D] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Free-Text Input Bar */}
          <form onSubmit={handleSendFreeText} className="p-3 bg-white border-t border-rose-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 bg-[#C97C5D] hover:bg-[#b0674a] text-white rounded-2xl transition disabled:opacity-40 shadow-sm"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

      {/* Floating Trigger Circle Button */}
      <button
        onClick={handleOpenChat}
        aria-label="Open Chat FAQ Widget"
        className="w-14 h-14 bg-gradient-to-tr from-[#3E2C23] via-[#C97C5D] to-[#D8A7B1] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 ring-4 ring-white/50"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

    </div>
  );
}
