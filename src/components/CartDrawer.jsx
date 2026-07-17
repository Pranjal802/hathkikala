import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty, cartTotal, addToCart } = useStore();

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
                cart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="bg-white rounded-2xl p-4 shadow-soft flex gap-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={24} className="text-[#C97C5D]/60" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-sans text-sm font-semibold text-[#3E2C23] leading-tight line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="font-sans text-xs text-[#5C4033]/50">{item.category}</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#D8A7B1] hover:text-[#C97C5D] transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty */}
                        <div className="flex items-center gap-2 bg-[#F5E6DA] rounded-xl p-1">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#D8A7B1] hover:text-white transition-all"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-sans text-sm font-bold text-[#3E2C23] w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#C97C5D] hover:text-white transition-all"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <span className="font-sans font-bold text-[#C97C5D]">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#F5E6DA] px-6 py-5 space-y-4">
                {/* Promo code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code..."
                    className="flex-1 bg-[#F5E6DA] px-4 py-2.5 rounded-xl font-sans text-sm text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#D8A7B1]"
                  />
                  <button className="bg-[#3E2C23] text-white px-4 py-2.5 rounded-xl font-sans text-sm font-medium hover:bg-[#5C4033] transition-colors">
                    Apply
                  </button>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-sans text-sm text-[#5C4033]/60">Subtotal</span>
                    <div className="font-serif text-2xl font-bold text-[#3E2C23]">₹{cartTotal.toLocaleString()}</div>
                    <span className="font-sans text-xs text-[#9CAF88]">✓ Free shipping on orders above ₹999</span>
                  </div>
                </div>

                <button
                  id="checkout-btn"
                  className="w-full bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white py-4 rounded-2xl font-sans font-semibold flex items-center justify-center gap-2 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all"
                >
                  <ShoppingBag size={18} />
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full text-[#5C4033]/60 font-sans text-sm hover:text-[#C97C5D] transition-colors py-1"
                >
                  Continue Shopping →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
