import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, ArrowRight } from 'lucide-react';

export default function CheckoutModal() {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    cartTotal,
    appliedCoupon,
    showNotification,
    user,
    setLoginOpen,
    setCart,
  } = useStore();

  const [step, setStep] = useState('address'); // 'address' | 'confirmation'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: user?.email ? user.email.split('@')[0] : '',
    phone: '9876543210',
    line1: 'Flat 402, Sunshine Apartments',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'

  if (!checkoutOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-3xl mx-auto text-[#C97C5D]">
            🔐
          </div>
          <h3 className="text-xl font-bold text-gray-800">Please Sign In to Checkout</h3>
          <p className="text-xs text-gray-500">Sign in to save your order, get instant tracking updates, and manage your account.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setCheckoutOpen(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setCheckoutOpen(false);
                setLoginOpen(true);
              }}
              className="px-6 py-2.5 bg-[#C97C5D] text-white rounded-2xl font-bold text-sm shadow hover:bg-[#b0674a]"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please sign in or create an account to complete your order', 'error');
      setLoginOpen(true);
      return;
    }

    if (cart.length === 0) {
      showNotification('Your cart is empty!', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress: addressForm,
        paymentMethod,
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setCreatedOrder(res.data.order);
        setCart([]);
        setStep('confirmation');
        showNotification('Order placed successfully! 🎉');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-rose-100 my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-extrabold text-lg">Secure Checkout</h3>
          </div>
          <button
            onClick={() => setCheckoutOpen(false)}
            className="p-1.5 bg-white/20 hover:bg-rose-600 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'address' ? (
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
            
            {/* Order Summary Box */}
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-gray-700">
                <span>Cart Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-bold">FREE (Pan-India)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#C97C5D] border-t border-rose-200 pt-2">
                <span>Total Payable</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C97C5D]" /> Delivery Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <input
                type="text"
                placeholder="Flat / House No. / Building Name / Street"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C97C5D]" /> Payment Options
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-[#C97C5D] bg-rose-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => {}} className="accent-[#C97C5D]" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when delivered</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('online')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    paymentMethod === 'online' ? 'border-[#C97C5D] bg-rose-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => {}} className="accent-[#C97C5D]" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">UPI / Cards</p>
                    <p className="text-xs text-gray-400">Instant online checkout</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order (₹${cartTotal})`} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto text-4xl shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-gray-800">Thank You for Your Order! 🎉</h3>
              <p className="text-sm text-gray-500">Your handmade creation is being prepared with care and love.</p>
              <div className="inline-block px-4 py-1.5 bg-rose-50 rounded-full border border-rose-100 text-[#C97C5D] font-mono font-bold text-sm">
                Order ID: #{createdOrder?.id?.substring(18)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-800 text-sm">Deliver To:</p>
              <p>{createdOrder?.shippingAddress?.fullName}</p>
              <p>{createdOrder?.shippingAddress?.line1}, {createdOrder?.shippingAddress?.city}</p>
              <p className="text-emerald-700 font-bold pt-1">Estimated Delivery: 3 - 5 Business Days</p>
            </div>

            <button
              onClick={() => {
                setCheckoutOpen(false);
                setStep('address');
              }}
              className="w-full py-3.5 bg-[#C97C5D] text-white font-bold rounded-2xl shadow hover:bg-[#b0674a]"
            >
              Back to Store
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
