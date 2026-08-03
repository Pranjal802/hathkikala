import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, ArrowRight, QrCode, Upload, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

const UPI_ID = import.meta.env.VITE_UPI_ID || '9313729507@hdfc';

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

  const [step, setStep] = useState('address'); // 'address' | 'upi_verification' | 'confirmation'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // Address form - empty by default unless user has saved addresses
  const [addressForm, setAddressForm] = useState(() => {
    const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddr) {
      return {
        fullName: defaultAddr.fullName || user?.name || '',
        phone: defaultAddr.phone || user?.phone || '',
        line1: defaultAddr.line1 || '',
        line2: defaultAddr.line2 || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        postalCode: defaultAddr.postalCode || '',
        country: defaultAddr.country || 'India',
      };
    }
    return {
      fullName: user?.name || (user?.email ? user.email.split('@')[0] : ''),
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    };
  });

  const [paymentMethod, setPaymentMethod] = useState('upi_qr'); // 'upi_qr' | 'cashfree' | 'cod'

  // Payment screenshot upload state
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file for the screenshot', 'error');
        return;
      }
      setPaymentScreenshotFile(file);
      setPaymentScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      showNotification('Please fill in all required shipping address fields', 'error');
      return;
    }

    if (cart.length === 0) {
      showNotification('Your cart is empty!', 'error');
      return;
    }

    if (paymentMethod === 'upi_qr') {
      setStep('upi_verification');
    } else {
      executeOrderPlacement(null);
    }
  };

  const executeOrderPlacement = async (proofUrl) => {
    setLoading(true);
    try {
      const selectedProvider = paymentMethod === 'upi_qr' ? 'upi_qr' : (paymentMethod === 'cashfree' || paymentMethod === 'online') ? 'cashfree' : 'cod';
      const payload = {
        shippingAddress: addressForm,
        paymentMethod: selectedProvider,
        ...(proofUrl ? { paymentProof: proofUrl } : {}),
      };

      const res = await api.createOrder(payload);
      if (res.success && res.data?.order) {
        const order = res.data.order;

        if (selectedProvider === 'cashfree') {
          try {
            const cfRes = await api.createCashfreeOrder(order.id);
            if (cfRes.success && cfRes.paymentSessionId) {
              if (!cfRes.isSimulationMode) {
                const cashfree = await load({ mode: 'sandbox' });
                await cashfree.checkout({
                  paymentSessionId: cfRes.paymentSessionId,
                  redirectTarget: '_modal',
                });
              }

              const verifyRes = await api.verifyCashfreePayment(order.id);
              if (verifyRes.success) {
                setCreatedOrder(verifyRes.data.order || order);
                setCart([]);
                setStep('confirmation');
                showNotification('Cashfree Payment Successful! 🎉');
                return;
              }
            }
          } catch (cfErr) {
            console.warn('Cashfree payment process note:', cfErr);
          }
        }

        setCreatedOrder(order);
        setCart([]);
        setStep('confirmation');
        if (selectedProvider === 'upi_qr') {
          showNotification('Payment proof submitted! Order placed successfully. 🎉');
        } else {
          showNotification('Order placed successfully! 🎉');
        }
      }
    } catch (err) {
      showNotification(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpiPayment = async (e) => {
    e.preventDefault();
    if (!paymentScreenshotFile) {
      showNotification('Please upload your payment screenshot before placing the order!', 'error');
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('image', paymentScreenshotFile);
      formData.append('folder', 'handmade/payment_proofs');

      const uploadRes = await api.uploadPaymentProof(formData);
      const proofUrl = uploadRes?.data?.url || uploadRes?.data?.secure_url;
      if (!proofUrl) {
        throw new Error('Failed to upload payment screenshot. Please try again.');
      }

      await executeOrderPlacement(proofUrl);
    } catch (err) {
      showNotification(err.message || 'Failed to upload screenshot', 'error');
    } finally {
      setUploadingProof(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Hath Ki Kala')}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order Payment')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-rose-100 my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-extrabold text-lg">
              {step === 'upi_verification' ? 'Payment Verification' : step === 'confirmation' ? 'Order Placed' : 'Secure Checkout'}
            </h3>
          </div>
          <button
            onClick={() => setCheckoutOpen(false)}
            className="p-1.5 bg-white/20 hover:bg-rose-600 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'address' && (
          <form onSubmit={handleAddressSubmit} className="p-6 space-y-6">
            
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
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C97C5D]" /> Delivery Address
                </h4>

                {(user?.addresses?.length || 0) > 0 && (
                  <span className="text-xs text-gray-400 font-medium">Select a saved address or enter new</span>
                )}
              </div>

              {/* Saved Address Quick Selector Chips */}
              {(user?.addresses?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-2 py-1">
                  {user.addresses.map((saved) => (
                    <button
                      key={saved.id || saved._id}
                      type="button"
                      onClick={() => {
                        setAddressForm({
                          fullName: saved.fullName || user.name || '',
                          phone: saved.phone || user.phone || '',
                          line1: saved.line1 || '',
                          line2: saved.line2 || '',
                          city: saved.city || '',
                          state: saved.state || '',
                          postalCode: saved.postalCode || '',
                          country: saved.country || 'India',
                        });
                        showNotification(`Selected address: ${saved.label || 'Home'} (${saved.city})`);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-[#C97C5D] transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C97C5D]" />
                      <span>{saved.label || 'Home'} ({saved.line1?.substring(0, 18)}...)</span>
                      {saved.isDefault && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full">Default</span>}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAddressForm({
                        fullName: user.name || '',
                        phone: user.phone || '',
                        line1: '',
                        line2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'India',
                      });
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                  >
                    + Clear Form
                  </button>
                </div>
              )}

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
                <CreditCard className="w-4 h-4 text-[#C97C5D]" /> Select Payment Method
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* UPI QR Payment Option */}
                <label
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    paymentMethod === 'upi_qr' ? 'border-[#C97C5D] bg-rose-50/70 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'upi_qr'} onChange={() => {}} className="accent-[#C97C5D]" />
                  <div>
                    <p className="font-bold text-sm text-gray-800 flex items-center gap-1">
                      <QrCode className="w-4 h-4 text-[#C97C5D]" /> Bank QR / UPI
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">GPay, PhonePe, Paytm</p>
                  </div>
                </label>

                {/* Cashfree Pay */}
                <label
                  onClick={() => setPaymentMethod('cashfree')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    paymentMethod === 'cashfree' ? 'border-[#C97C5D] bg-rose-50/70 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'cashfree'} onChange={() => {}} className="accent-[#C97C5D]" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">Cashfree Pay</p>
                    <p className="text-[11px] text-gray-500">Cards & NetBanking</p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-[#C97C5D] bg-rose-50/70 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => {}} className="accent-[#C97C5D]" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">Cash on Delivery</p>
                    <p className="text-[11px] text-gray-500">Pay when delivered</p>
                  </div>
                </label>
              </div>
            </div>

            {/* UPI QR Code Details Card when UPI QR is selected */}
            {paymentMethod === 'upi_qr' && (
              <div className="bg-gradient-to-br from-amber-50/60 to-rose-50/60 p-4 rounded-2xl border border-amber-200 text-center space-y-3">
                <p className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#C97C5D]" /> Scan QR Code or Click below to Pay via UPI App
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                  <div className="bg-white p-2 rounded-2xl shadow border border-rose-100">
                    <img src="/QR.png" alt="Bank UPI QR Code" className="w-36 h-36 object-contain rounded-xl" />
                  </div>

                  <div className="text-left space-y-1.5 text-xs text-gray-700">
                    <p><span className="font-semibold text-gray-500">UPI ID:</span> <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border">{UPI_ID}</span></p>
                    <p><span className="font-semibold text-gray-500">Account Name:</span> <span className="font-bold text-gray-800">Hath Ki Kala</span></p>
                    <p><span className="font-semibold text-gray-500">Amount to Pay:</span> <span className="font-extrabold text-[#C97C5D] text-sm">₹{cartTotal}</span></p>
                    
                    {/* Deep link button for smartphones to trigger installed UPI apps */}
                    <a
                      href={upiDeepLink}
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
                    >
                      <Smartphone className="w-4 h-4" /> Pay via Mobile UPI App (GPay / PhonePe / Paytm)
                    </a>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 italic">
                  Note: On mobile, clicking the button launches your installed UPI apps directly. After payment, click "Proceed to Payment Verification" to attach your screenshot.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {paymentMethod === 'upi_qr' ? (
                <>Proceed to Payment Verification (₹{cartTotal}) <ArrowRight className="w-5 h-5" /></>
              ) : (
                <>{loading ? 'Processing Order...' : `Confirm & Place Order (₹${cartTotal})`} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        {/* Step 2: UPI Payment Screenshot Upload & Verification */}
        {step === 'upi_verification' && (
          <form onSubmit={handleConfirmUpiPayment} className="p-6 space-y-6 animate-fadeIn">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-extrabold text-gray-800 text-base">Have you completed the payment?</h4>
              <p className="text-xs text-gray-600">
                Please confirm that you have sent <span className="font-extrabold text-[#C97C5D]">₹{cartTotal}</span> to UPI ID <span className="font-mono font-bold text-gray-800">{UPI_ID}</span>.
              </p>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Upload Payment Screenshot / Proof <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-rose-200 hover:border-[#C97C5D] rounded-2xl p-4 text-center cursor-pointer bg-rose-50/30 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer block space-y-2">
                  {paymentScreenshotPreview ? (
                    <div className="space-y-2">
                      <img
                        src={paymentScreenshotPreview}
                        alt="Payment Screenshot Preview"
                        className="max-h-48 mx-auto rounded-xl border shadow-sm object-contain"
                      />
                      <p className="text-xs text-emerald-600 font-bold">✓ Screenshot attached. Click to change image.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <Upload className="w-10 h-10 text-[#C97C5D] mx-auto" />
                      <p className="text-sm font-bold text-gray-700">Click to select screenshot from your phone / device</p>
                      <p className="text-xs text-gray-400">Supports PNG, JPG, JPEG screenshots</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800">
              ℹ️ After customer adds that screenshot, the team will confirm the order and will give an update to you.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('address')}
                className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-sm transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={uploadingProof || loading || !paymentScreenshotFile}
                className="w-2/3 py-3.5 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {(uploadingProof || loading) ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Proof...</>
                ) : (
                  <>Submit Proof & Confirm Order <CheckCircle2 className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation Screen */}
        {step === 'confirmation' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto text-4xl shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-gray-800">Order Placed Successfully! 🎉</h3>
              <p className="text-sm text-gray-600 font-medium">
                The team will confirm the order and will give an update to you in your account Order section.
              </p>
              <div className="inline-block px-4 py-1.5 bg-rose-50 rounded-full border border-rose-100 text-[#C97C5D] font-mono font-bold text-sm">
                Order ID: #{createdOrder?.id?.substring(18)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left text-xs text-gray-600 space-y-1 border">
              <p className="font-bold text-gray-800 text-sm">Deliver To:</p>
              <p>{createdOrder?.shippingAddress?.fullName}</p>
              <p>{createdOrder?.shippingAddress?.line1}, {createdOrder?.shippingAddress?.city}</p>
              <p className="text-emerald-700 font-bold pt-1">Status: Pending Admin Confirmation</p>
            </div>

            <button
              onClick={() => {
                setCheckoutOpen(false);
                setStep('address');
                setPaymentScreenshotFile(null);
                setPaymentScreenshotPreview('');
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
