import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import { api } from '../services/api';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQty,
    cartSubtotal,
    cartTotal,
    discountAmount,
    appliedCoupon,
    setAppliedCoupon,
    setCheckoutOpen,
    showNotification,
    user,
    setLoginOpen,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const res = await api.validateCoupon(couponCode, cartSubtotal);
      if (res.success) {
        setAppliedCoupon(res.data);
        showNotification(`Coupon ${res.data.code} applied! Saved ₹${res.data.discountAmount} 🎉`);
      }
    } catch (err) {
      showNotification(err.message || 'Invalid coupon code', 'error');
    } finally {
      setValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-[#3E2C23]/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF8F2] z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F5E6DA]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] rounded-xl flex items-center justify-center">
                  <ShoppingCart size={17} className="text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#3E2C23]">Your Cart</h2>
                  <p className="font-sans text-xs text-[#5C4033]/60">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                id="cart-close-btn"
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#F5E6DA] flex items-center justify-center hover:bg-[#D8A7B1] hover:text-white transition-all text-[#3E2C23]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] rounded-3xl flex items-center justify-center">
                    <ShoppingCart size={44} className="text-[#C97C5D]/40" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#3E2C23] mb-2">Your cart is empty</h3>
                  <p className="font-sans text-sm text-[#5C4033]/60 mb-6">Add some handmade magic to get started!</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white px-6 py-3 rounded-full font-sans font-semibold text-sm shadow-soft"
                  >
                    <span className="flex items-center gap-2"><Sparkles size={15} /> Browse Products</span>
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item._id || item.productId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex gap-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] rounded-xl flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
                      {item.thumbnail ? <img src={resolveImageUrl(item.thumbnail)} alt="" className="w-full h-full object-cover" /> : '🧸'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-sans text-sm font-semibold text-[#3E2C23] leading-tight line-clamp-1">
                            {item.productName || item.name}
                          </h4>
                          <span className="font-sans text-xs text-[#5C4033]/50">SKU: {item.variantSku}</span>
                        </div>
                        <button
                          onClick={() => updateCartQty(item.id || item._id, -item.quantity)}
                          className="text-[#D8A7B1] hover:text-[#C97C5D] transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty */}
                        <div className="flex items-center gap-2 bg-[#F5E6DA] rounded-xl p-1">
                          <button
                            onClick={() => updateCartQty(item.id || item._id, -1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#D8A7B1] hover:text-white transition-all text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="font-sans text-sm font-bold text-[#3E2C23] w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.id || item._id, 1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#C97C5D] hover:text-white transition-all text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-sans font-extrabold text-[#C97C5D]">
                          ₹{(item.priceSnapshot * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#F5E6DA] px-6 py-5 space-y-3">
                {/* Promo code */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (WELCOME10)..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#F5E6DA] px-4 py-2.5 rounded-xl font-sans text-xs uppercase font-bold text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none"
                  />
                  <button type="submit" disabled={validating} className="bg-[#3E2C23] text-white px-4 py-2.5 rounded-xl font-sans text-xs font-bold hover:bg-[#5C4033] transition-colors">
                    {validating ? '...' : 'Apply'}
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Code {appliedCoupon.code} Applied</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-sans text-xs text-[#5C4033]/60">Total Payable</span>
                    <div className="font-serif text-2xl font-bold text-[#3E2C23]">₹{cartTotal.toLocaleString()}</div>
                    <span className="font-sans text-[11px] text-[#9CAF88] font-semibold">✓ Free shipping across India</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    if (!user) {
                      showNotification('Please sign in or create an account to proceed to checkout', 'error');
                      setLoginOpen(true);
                    } else {
                      setCheckoutOpen(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-3.5 rounded-2xl font-sans font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <ShoppingBag size={18} />
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
