import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, Share2, Check, HandHeart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';

export default function QuickViewModal() {
  const { quickViewProduct: product, setQuickViewProduct, addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="fixed inset-0 bg-[#3E2C23]/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#FFF8F2] rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Close btn */}
              <button
                id="quickview-close-btn"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-5 right-5 z-10 w-9 h-9 bg-white rounded-xl shadow-soft flex items-center justify-center text-[#5C4033] hover:bg-[#D8A7B1] hover:text-white transition-all"
              >
                <X size={16} />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] flex items-center justify-center p-12 min-h-64">
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-36 h-36 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-lg"
                  >
                    <ShoppingBag size={64} className="text-[#C97C5D]/60" />
                  </motion.div>
                </div>

                {/* Details */}
                <div className="p-7 flex flex-col">
                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className={`${product.badgeColor} text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full`}>
                      {product.badge}
                    </span>
                    <span className="bg-[#9CAF88] text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full">
                      Handmade
                    </span>
                    <span className="bg-[#3E2C23] text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  </div>

                  <span className="font-sans text-xs font-medium text-[#9CAF88] uppercase tracking-wide mb-1">
                    {product.category}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#3E2C23] mb-3 leading-tight">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < Math.floor(product.rating) ? 'fill-[#D4A373] text-[#D4A373]' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="font-sans text-xs text-[#5C4033]/60">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-sans text-3xl font-bold text-[#C97C5D]">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-base text-[#5C4033]/40 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  </div>

                  <p className="font-sans text-sm text-[#5C4033]/75 leading-relaxed mb-5">
                    {product.description}
                  </p>

                  {/* Color dots */}
                  <div className="mb-5">
                    <p className="font-sans text-xs font-medium text-[#3E2C23] mb-2">Available Colors</p>
                    <div className="flex gap-2">
                      {product.colors.map((c, i) => (
                        <button
                          key={i}
                          style={{ backgroundColor: c }}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-soft hover:scale-110 transition-transform"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center gap-3 mb-6">
                    <p className="font-sans text-xs font-medium text-[#3E2C23]">Qty:</p>
                    <div className="flex items-center gap-2 bg-[#F5E6DA] rounded-xl p-1">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#D8A7B1] hover:text-white transition-all font-bold text-sm"
                      >
                        −
                      </button>
                      <span className="font-sans font-bold text-[#3E2C23] w-6 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#C97C5D] hover:text-white transition-all font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      id="quickview-add-btn"
                      onClick={handleAdd}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-sans font-semibold text-sm transition-all shadow-soft hover:shadow-card ${
                        added
                          ? 'bg-[#9CAF88] text-white'
                          : 'bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white'
                      }`}
                    >
                      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {added ? 'Added!' : 'Add to Cart'}
                    </motion.button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft transition-all hover:-translate-y-0.5 ${
                        isWishlisted(product.id)
                          ? 'bg-[#D8A7B1] text-white'
                          : 'bg-[#F5E6DA] text-[#D8A7B1]'
                      }`}
                    >
                      <Heart size={18} className={isWishlisted(product.id) ? 'fill-white' : ''} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-[#F5E6DA] text-[#5C4033] flex items-center justify-center shadow-soft hover:-translate-y-0.5 transition-all">
                      <Share2 size={17} />
                    </button>
                  </div>

                  {/* Trust badge */}
                  <div className="flex items-center gap-2 mt-5 bg-[#F5E6DA]/60 rounded-xl px-3 py-2">
                    <HandHeart size={18} className="text-[#C97C5D] flex-shrink-0" />
                    <span className="font-sans text-xs text-[#5C4033]/70">
                      100% Handmade · Crafted with Love · Premium Materials
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
