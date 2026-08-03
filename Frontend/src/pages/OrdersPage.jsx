import { useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import { Package, Truck, CheckCircle2, Clock, MapPin, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const { user, userOrders, fetchMyOrders, setLoginOpen } = useStore();

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user, fetchMyOrders]);

  if (!user) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm">
          🔒
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#3E2C23] mb-2">Sign In to Track Orders</h2>
        <p className="font-sans text-xs text-[#5C4033]/70 max-w-sm mb-6">
          Please log in to your Hath Ki Kala customer account to view your order history and real-time shipment updates.
        </p>
        <button
          onClick={() => setLoginOpen(true)}
          className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white px-8 py-3.5 rounded-2xl font-sans font-bold text-xs shadow-md hover:shadow-lg transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-12 px-4 text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> My Account
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-2">Order History & Shipment Tracking</h1>
          <p className="font-sans text-xs text-rose-100/80">Account: {user.email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-4">
            <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center mx-auto text-4xl">
              🛍️
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#3E2C23]">No orders placed yet</h3>
            <p className="font-sans text-xs text-[#5C4033]/70">Explore our handmade creations and place your first order!</p>
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white px-6 py-3 rounded-2xl font-bold text-xs shadow"
            >
              Browse Shop Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#C97C5D]">Order #{order.id.substring(18)}</span>
                    <p className="font-sans text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>

                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'cancelled' || order.status === 'refunded' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {order.status === 'confirmed' ? 'Confirmed ✓' : order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm overflow-hidden">
                          {item.thumbnail ? <img src={resolveImageUrl(item.thumbnail)} alt="" className="w-full h-full object-cover" /> : '🧸'}
                        </div>
                        <div>
                          <p className="font-sans text-sm font-bold text-[#3E2C23]">{item.productName}</p>
                          <span className="font-sans text-xs text-gray-400">Qty: {item.quantity} · SKU: {item.variantSku}</span>
                        </div>
                      </div>
                      <span className="font-sans text-sm font-extrabold text-[#C97C5D]">₹{item.priceSnapshot * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking info if shipped */}
                {order.trackingNumber && (
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Truck size={15} /> Courier Shipment Tracking
                    </span>
                    <p>Courier: <strong>{order.courierName || 'Standard Express'}</strong> · AWB: <strong className="font-mono">{order.trackingNumber}</strong></p>
                  </div>
                )}

                {/* Footer total */}
                <div className="flex items-center justify-between pt-4 border-t border-rose-100 text-xs">
                  <div>
                    <span className="text-gray-400">Shipping Address:</span>
                    <p className="font-bold text-[#3E2C23]">{order.shippingAddress?.fullName}, {order.shippingAddress?.city}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">Total Paid</span>
                    <span className="font-serif text-xl font-extrabold text-[#3E2C23]">₹{order.totalAmount}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
