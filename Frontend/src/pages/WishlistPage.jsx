import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import { Heart, ShoppingBag, Trash2, ArrowLeft, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { user, showNotification, addToCart } = useStore();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await api.getWishlist();
        if (res.success && res.data?.wishlist) {
          setWishlistItems(res.data.wishlist);
        }
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, [user]);

  const handleMoveToCart = async (item) => {
    if (item.isOutOfStock) {
      showNotification('This item is currently Out of Stock', 'error');
      return;
    }
    try {
      const res = await api.moveWishlistToCart(item.productId, item.variants?.[0]?.sku);
      if (res.success) {
        showNotification(res.message || 'Moved to Cart! 🛍️');
        fetchWishlistData();
      }
    } catch (err) {
      showNotification(err.message || 'Could not move to cart', 'error');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await api.toggleWishlist(productId);
      if (res.success) {
        showNotification('Removed from Wishlist 💔');
        setWishlistItems((prev) => prev.filter((i) => i.productId !== productId));
      }
    } catch (err) {
      showNotification(err.message || 'Could not remove item', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#C97C5D] hover:underline">
            <ArrowLeft size={16} /> Back to Storefront
          </Link>
          <span className="text-xs font-bold text-gray-500 font-mono">
            {wishlistItems.length} Saved {wishlistItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {/* Hero Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-4xl shadow-xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
                <Heart size={20} className="fill-rose-500" />
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#3E2C23]">My Saved Wishlist</h1>
            </div>
            <p className="text-xs text-[#5C4033]/70 font-medium">
              Save your favorite handcrafted items, track stock availability, and move to cart whenever you are ready!
            </p>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-4xl border border-rose-100 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#C97C5D] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Loading your saved favorites...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white p-12 rounded-4xl border border-rose-100 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-3xl flex items-center justify-center mx-auto">
              <Heart size={32} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif text-lg font-bold text-[#3E2C23]">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-500 font-medium">
                Tap the heart icon on any handmade product card while browsing to save it to your wishlist!
              </p>
            </div>
            <Link
              to="/"
              className="inline-block bg-[#C97C5D] hover:bg-[#b0674a] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow transition"
            >
              Explore Collection ✨
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-3xl p-4 border border-rose-100 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square bg-rose-50/50 rounded-2xl overflow-hidden group">
                    <img
                      src={resolveImageUrl(item.images?.[0]?.url || item.thumbnail)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Stock Status Badge */}
                    {item.isOutOfStock ? (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        In Stock
                      </span>
                    )}

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-rose-50 text-rose-500 rounded-full shadow transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-sm text-[#C97C5D]">₹{item.basePrice}</span>
                      {item.compareAtPrice && item.compareAtPrice > item.basePrice && (
                        <span className="text-xs text-gray-400 line-through">₹{item.compareAtPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move to Cart Action Button */}
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={item.isOutOfStock}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow transition flex items-center justify-center gap-2 ${
                    item.isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-[#C97C5D] hover:bg-[#b0674a] text-white shadow-md'
                  }`}
                >
                  <ShoppingBag size={15} />
                  {item.isOutOfStock ? 'Currently Unavailable' : 'Move to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
