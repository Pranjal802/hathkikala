import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, Check, HandHeart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useState, useEffect } from 'react';

export default function QuickViewModal() {
  const { quickViewProduct: product, setQuickViewProduct, addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const [selectedVariantSku, setSelectedVariantSku] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQty(1);
    setSelectedVariantSku(null);
  }, [product?.id]);

  if (!product) return null;

  const currentVariantSku = selectedVariantSku || product.variants?.[0]?.sku || `SKU-${product.id}`;
  const currentVariant = product.variants?.find((v) => v.sku === currentVariantSku);
  const currentPrice = currentVariant ? currentVariant.price : (product.discountPrice || product.basePrice);

  const handleAdd = () => {
    addToCart(product, currentVariantSku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
            <div className="bg-[#FFF8F2] rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-rose-100 relative">
              {/* Close btn */}
              <button
                id="quickview-close-btn"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-5 right-5 z-10 w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#5C4033] hover:bg-[#D8A7B1] hover:text-white transition-all"
              >
                <X size={16} />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] flex items-center justify-center p-8 min-h-64 relative">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover rounded-2xl shadow-md" />
                  ) : (
                    <span className="text-8xl">{product.emoji || '🧸'}</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {product.badge && (
                        <span className="bg-[#C97C5D] text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full uppercase">
                          {product.badge}
                        </span>
                      )}
                      <span className="bg-[#9CAF88] text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full">
                        100% Handmade
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl font-bold text-[#3E2C23] mb-2 leading-tight">
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-sans text-3xl font-extrabold text-[#C97C5D]">
                        ₹{currentPrice}
                      </span>
                      {product.discountPrice && (
                        <span className="font-sans text-base text-[#5C4033]/40 line-through">
                          ₹{product.basePrice}
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-[#5C4033]/80 leading-relaxed mb-4">
                      {product.description || 'Authentic handmade craftsmanship built with love, care, and fine detailing.'}
                    </p>

                    {/* Variant Selector */}
                    {product.variants?.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Select Option / Variant:</label>
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v) => (
                            <button
                              key={v.sku}
                              onClick={() => setSelectedVariantSku(v.sku)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                currentVariantSku === v.sku
                                  ? 'bg-[#C97C5D] text-white border-[#C97C5D]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-rose-50'
                              }`}
                            >
                              {v.attributes ? Object.values(v.attributes).join(' / ') : v.sku} (₹{v.price})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qty */}
                    <div className="flex items-center gap-3 mb-6">
                      <p className="font-sans text-xs font-bold text-[#3E2C23]">Quantity:</p>
                      <div className="flex items-center gap-2 bg-[#F5E6DA] rounded-xl p-1">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#D8A7B1] hover:text-white transition-all font-bold text-sm"
                        >
                          −
                        </button>
                        <span className="font-sans font-bold text-[#3E2C23] w-6 text-center">{qty}</span>
                        <button
                          onClick={() => setQty((q) => q + 1)}
                          className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#C97C5D] hover:text-white transition-all font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="flex gap-2">
                      <motion.button
                        id="quickview-add-btn"
                        onClick={handleAdd}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-sans font-bold text-sm transition-all shadow-md ${
                          added
                            ? 'bg-[#9CAF88] text-white'
                            : 'bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white'
                        }`}
                      >
                        {added ? <Check size={18} className="shrink-0" /> : <ShoppingCart size={18} className="shrink-0" />}
                        {added ? 'Added to Cart!' : `Add to Cart (₹${currentPrice * qty})`}
                      </motion.button>

                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                          isWishlisted(product.id)
                            ? 'bg-[#D8A7B1] text-white'
                            : 'bg-[#F5E6DA] text-[#D8A7B1]'
                        }`}
                      >
                        <Heart size={18} className={isWishlisted(product.id) ? 'fill-white' : ''} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-4 bg-[#F5E6DA]/60 rounded-xl px-3 py-2">
                      <HandHeart size={16} className="text-[#C97C5D] flex-shrink-0" />
                      <span className="font-sans text-[11px] text-[#5C4033]/80">
                        100% Authentic Handcrafted · Secure Checkout
                      </span>
                    </div>
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
