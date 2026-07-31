import { useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { X, Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

export default function OrdersModal() {
  const { ordersOpen, setOrdersOpen, userOrders } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOrdersOpen(false);
      }
    };
    if (ordersOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ordersOpen, setOrdersOpen]);

  if (!ordersOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'shipped':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs flex items-center gap-1"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'in_production':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> In Production</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs flex items-center gap-1"><Package className="w-3 h-3" /> {status?.replace('_', ' ')}</span>;
    }
  };

  return (
    <div
      onClick={() => setOrdersOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-rose-100 my-auto cursor-default"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] px-6 py-4 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h3 className="font-extrabold text-lg">My Orders & Tracking</h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOrdersOpen(false);
            }}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
          {userOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-5xl">🛍️</span>
              <h4 className="text-lg font-bold text-gray-700">No Orders Placed Yet</h4>
              <p className="text-xs text-gray-400">Explore our handmade collection and place your first order!</p>
            </div>
          ) : (
            userOrders.map((ord) => (
              <div key={ord.id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                
                {/* Order Summary Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Order Reference</span>
                    <h4 className="font-mono font-bold text-[#C97C5D]">#{ord.id.substring(18)}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(ord.status)}
                    <span className="font-extrabold text-gray-800 text-lg">₹{ord.totalAmount}</span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#C97C5D] rounded-full"></span>
                        <span className="font-semibold text-gray-800">{item.productName}</span>
                        <span className="text-xs text-gray-400">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-700">₹{item.unitPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking Info if available */}
                {ord.trackingNumber && (
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                    <span>Courier: <strong>{ord.courierName || 'Standard Express'}</strong></span>
                    <span>Tracking #: <strong className="font-mono">{ord.trackingNumber}</strong></span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
