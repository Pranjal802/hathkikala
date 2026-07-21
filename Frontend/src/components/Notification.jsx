import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Notification() {
  const { notification } = useStore();

  return (
    <div className="fixed top-24 right-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-hover max-w-xs pointer-events-auto ${
              notification.type === 'success'
                ? 'bg-white border border-[#9CAF88]/30'
                : 'bg-white border border-[#C97C5D]/30'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[#9CAF88] flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-[#C97C5D] flex-shrink-0" />
            )}
            <p className="font-sans text-sm text-[#3E2C23] font-medium">{notification.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
