import { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, AlertCircle, ArrowLeft, Download, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuestOrderTrackingPage() {
  const { showNotification } = useStore();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      showNotification('Please enter both Order ID and Phone Number', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.guestLookupOrder(orderId.trim(), phone.trim());
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
        showNotification('Order retrieved successfully! ✨');
      }
    } catch (err) {
      showNotification(err.message || 'No order found matching these details', 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'placed': return 0;
      case 'confirmed': return 1;
      case 'in_production': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const statusSteps = [
    { title: 'Placed', icon: Clock },
    { title: 'Confirmed', icon: CheckCircle2 },
    { title: 'In Production', icon: HeartHandshake, note: 'Handcrafted by Artisans' },
    { title: 'Shipped', icon: Truck },
    { title: 'Delivered', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F2] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#C97C5D] hover:underline">
            <ArrowLeft size={16} /> Back to Storefront
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C4033]/70">
            <ShieldCheck size={16} className="text-[#9CAF88]" /> Guest Self-Service Tracker
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-xl border border-rose-100 space-y-6 text-center">
          <div className="w-16 h-16 bg-[#F5E6DA] text-[#C97C5D] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Search size={28} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-[#C97C5D] block mb-1">
              Live Order Status Lookup
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#3E2C23]">Track Your Guest Order</h1>
            <p className="font-sans text-xs text-[#5C4033]/70 max-w-md mx-auto mt-1">
              Placed an order without creating an account? Enter your Order ID and Phone Number below to track live artisan production and shipping.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4 max-w-md mx-auto text-left pt-2">
            <div>
              <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                Order ID / Reference Number
              </label>
              <input
                type="text"
                placeholder="e.g. 641e638011054582..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-2xl font-mono text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-1">
                Phone Number (Used during checkout)
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#F5E6DA]/50 px-4 py-3 rounded-2xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C97C5D] hover:bg-[#b0674a] text-white py-3.5 rounded-2xl font-sans font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? 'Searching Order...' : 'Track My Order ✨'}
            </button>
          </form>
        </div>

        {/* Order Details Display Card */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-4xl shadow-xl border border-rose-100 space-y-8 animate-fadeIn">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C97C5D]">
                  Order Record
                </span>
                <h3 className="font-mono text-xl font-bold text-gray-800">#{order.id || order._id}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  order.status === 'in_production' ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse' :
                  order.status === 'cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {order.status === 'in_production' ? '🎨 In Production (Handcrafting)' : order.status}
                </span>
              </div>
            </div>

            {/* Visual Stepper */}
            {order.status !== 'cancelled' ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Fulfillment Progress</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = getStatusStepIndex(order.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-[#C97C5D] text-white border-[#C97C5D] shadow-md scale-105'
                            : isCompleted
                            ? 'bg-rose-50 text-[#C97C5D] border-rose-200 font-semibold'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                        <StepIcon className="w-5 h-5 mx-auto mb-1.5" />
                        <span className="text-[11px] font-bold block">{step.title}</span>
                        {step.note && (
                          <span className={`text-[9px] block mt-0.5 ${isCurrent ? 'text-rose-100' : 'text-gray-400'}`}>
                            {step.note}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                This order was cancelled. {order.cancelReason ? `Reason: "${order.cancelReason}"` : ''}
              </div>
            )}

            {/* Customization Banner if present */}
            {order.customizationNotes && (
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1.5 text-purple-800">
                  ✨ Customization Instructions Request:
                </span>
                <p className="font-medium text-purple-800/90">{order.customizationNotes}</p>
              </div>
            )}

            {/* Tracking / Courier Box if shipped */}
            {order.trackingNumber && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" /> Courier & Shipping Details
                  </span>
                  <span className="text-xs font-bold text-blue-700">{order.courierName || 'Standard Express'}</span>
                </div>
                <div className="text-xs text-blue-900 font-mono font-bold">
                  Tracking #: {order.trackingNumber}
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-bold text-blue-600 hover:underline pt-1"
                  >
                    Click to Open Live Carrier Tracking →
                  </a>
                )}
              </div>
            )}

            {/* Order Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items ({order.items?.length || 0})</h4>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 text-lg">
                        {item.thumbnail ? (
                          <img src={resolveImageUrl(item.thumbnail)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-800">{item.productName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          SKU: {item.variantSku} × Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-gray-800">₹{item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Total Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C97C5D]" /> Delivery Address
                </span>
                <p className="text-xs font-bold text-gray-800">{order.shippingAddress?.fullName}</p>
                <p className="text-xs text-gray-600">{order.shippingAddress?.line1}, {order.shippingAddress?.line2}</p>
                <p className="text-xs text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                <p className="text-xs font-mono text-gray-500">📞 {order.shippingAddress?.phone}</p>
              </div>

              <div className="bg-[#FFF8F2] p-4 rounded-2xl border border-rose-100 space-y-2 text-right">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#3E2C23] pt-2 border-t border-rose-200/60">
                  <span>Total Amount Paid</span>
                  <span className="text-[#C97C5D]">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
