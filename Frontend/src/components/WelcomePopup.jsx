import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Instagram, MessageCircleHeart, Sparkles, Phone } from "lucide-react";

// ── Contact details ──
const INSTAGRAM_HANDLE = "@hathkikala_shop";
const INSTAGRAM_URL = "https://www.instagram.com/hathkikala_shop/?hl=en";
const PHONE_NUMBERS = ["+91 93137 29507", "+91 93134 37014"];

// Re-show the popup this often while the tab stays open (in minutes)
const REPEAT_EVERY_MINUTES = 10;

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show shortly after every page load / refresh
    const openTimer = setTimeout(() => setIsOpen(true), 600);

    // Then keep re-showing on a fixed interval while the tab is open
    const repeatTimer = setInterval(
      () => setIsOpen(true),
      REPEAT_EVERY_MINUTES * 60 * 1000
    );

    return () => {
      clearTimeout(openTimer);
      clearInterval(repeatTimer);
    };
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3A3A3A]/60 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#F5F1E8] rounded-[28px] shadow-2xl border border-[#E8DDD0] overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-2 bg-gradient-to-r from-[#4F6B5C] via-[#6B8E7F] to-[#C9A227]" />

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close popup"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#5A5A5A] hover:bg-white hover:text-[#4F6B5C] transition-all duration-300"
            >
              <X size={18} />
            </button>

            <div className="px-7 pt-8 pb-7 sm:px-9 sm:pt-9 sm:pb-8">
              <span className="inline-flex items-center gap-2 text-xs tracking-[3px] uppercase text-[#9D6B7F] font-semibold mb-4">
                <Sparkles size={14} /> Coming Soon
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#3A3A3A] leading-snug mb-4">
                We're getting ready to launch!
              </h2>

              <p className="text-sm sm:text-base text-[#5A5A5A] leading-relaxed mb-4">
                Right now you can browse our collections and get to know us —
                online ordering isn't open just yet. Love something already?
                Message us on Instagram or call us directly to place your order.
              </p>

              <p className="text-sm sm:text-base text-[#5A5A5A] leading-relaxed mb-6">
                Have an idea that could make your experience or our products
                even better? We'd genuinely love to hear it.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-br from-[#6B8E7F] to-[#4F6B5C] text-white text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <Instagram size={16} className="shrink-0" />
                  DM on Instagram
                </a>

                <button
                  onClick={handleClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-full border border-[#6B8E7F] text-[#4F6B5C] text-sm font-semibold whitespace-nowrap hover:bg-[#E8DDD0] transition-all duration-300"
                >
                  <MessageCircleHeart size={16} className="shrink-0" />
                  Just browsing
                </button>
              </div>

              {/* Phone numbers */}
              <div className="flex flex-col sm:flex-row gap-x-5 gap-y-1.5 mt-4">
                {PHONE_NUMBERS.map((num) => (
                  <a
                    key={num}
                    href={`tel:${num.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm text-[#4F6B5C] font-medium hover:text-[#9D6B7F] transition-colors duration-300"
                  >
                    <Phone size={14} />
                    {num}
                  </a>
                ))}
              </div>

              <p className="text-xs text-[#9D6B7F] mt-4 text-center sm:text-left">
                {INSTAGRAM_HANDLE}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}