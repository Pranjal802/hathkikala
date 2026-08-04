import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Heart, ShoppingCart, Check, HandHeart, ShieldCheck, Truck, RotateCcw, ChevronRight, Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import VirtualTryOnModal from '../components/VirtualTryOnModal.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, isWishlisted, showNotification } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantSku, setSelectedVariantSku] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProductBySlug(slug);
        if (res.success) {
          setProduct(res.data.product);
          if (res.data.product.variants?.length > 0) {
            setSelectedVariantSku(res.data.product.variants[0].sku);
          }
        }
      } catch (err) {
        showNotification('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug, showNotification]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#FFF8F2]">
        <div className="w-12 h-12 border-4 border-[#C97C5D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center bg-[#FFF8F2] space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#3E2C23]">Product Not Found</h2>
        <Link to="/products" className="inline-block bg-[#C97C5D] text-white px-6 py-2.5 rounded-xl font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentVariantSku = selectedVariantSku || product.variants?.[0]?.sku || `SKU-${product.id}`;
  const currentVariant = product.variants?.find((v) => v.sku === currentVariantSku);
  const currentPrice = currentVariant ? currentVariant.price : (product.discountPrice || product.basePrice);

  const handleAddToCart = () => {
    addToCart(product, currentVariantSku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const images = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : [product.thumbnail || null];

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5C4033]/60 mb-6 font-medium">
          <Link to="/" className="hover:text-[#C97C5D]">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-[#C97C5D]">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-[#3E2C23] font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-4xl shadow-sm border border-rose-100">
          
          {/* PHOTO GALLERY */}
          <div className="space-y-4">
            <div className="relative h-96 sm:h-[450px] bg-gradient-to-br from-[#F5E6DA]/50 to-[#FDEEE4]/50 rounded-3xl overflow-hidden flex items-center justify-center border border-rose-100">
              {images[activeImageIndex] ? (
                <img src={resolveImageUrl(images[activeImageIndex])} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl">{product.emoji || '🧸'}</span>
              )}

              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#C97C5D] text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === i ? 'border-[#C97C5D] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveImageUrl(imgUrl)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#9CAF88] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  100% Handcrafted
                </span>
                <span className="bg-[#3E2C23] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Artisanal Quality
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2C23] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-[#D4A017] text-[#D4A017]" />
                  ))}
                </div>
                <span className="font-sans text-xs font-bold text-gray-500">
                  5.0 (28 customer reviews)
                </span>
              </div>

              {/* Pricing & Discount Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-4xl font-extrabold text-[#C97C5D]">
                  ₹{currentPrice}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="font-sans text-lg text-gray-400 line-through">
                      ₹{product.basePrice}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200 shadow-sm">
                      {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="font-sans text-sm text-[#5C4033]/80 leading-relaxed">
                {product.description || 'Intricately handcrafted with non-toxic, eco-friendly materials built to last.'}
              </p>

              {/* Variant Selector */}
              {product.variants?.length > 1 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider">
                    Select Option / Size / Color:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedVariantSku(v.sku)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                          currentVariantSku === v.sku
                            ? 'bg-[#C97C5D] text-white border-[#C97C5D] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-rose-50'
                        }`}
                      >
                        {v.attributes ? Object.values(v.attributes).join(' / ') : v.sku} (₹{v.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <span className="font-sans text-xs font-bold text-[#3E2C23]">Quantity:</span>
                <div className="flex items-center gap-3 bg-[#F5E6DA] p-1.5 rounded-2xl">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 bg-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#D8A7B1] hover:text-white transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-bold text-[#3E2C23] w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 bg-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#C97C5D] hover:text-white transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-rose-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    added ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white hover:shadow-lg'
                  }`}
                >
                  {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {added ? 'Added to Cart!' : `Add to Cart • ₹${currentPrice * qty}`}
                </button>

                <button
                  onClick={() => setTryOnOpen(true)}
                  className="px-5 py-4 bg-[#3E2C23] hover:bg-[#C97C5D] text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-amber-300 animate-pulse" /> AI Virtual Try-On
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition ${
                    isWishlisted(product.id) ? 'bg-[#D8A7B1] text-white' : 'bg-[#F5E6DA] text-[#D8A7B1]'
                  }`}
                >
                  <Heart size={20} className={isWishlisted(product.id) ? 'fill-white' : ''} />
                </button>
              </div>

              {/* AI Virtual Try-On Modal */}
              <VirtualTryOnModal
                product={product}
                isOpen={tryOnOpen}
                onClose={() => setTryOnOpen(false)}
              />

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 bg-[#F5E6DA]/40 p-3 rounded-2xl text-center text-[11px] text-[#5C4033]/80 font-bold">
                <div className="flex flex-col items-center gap-1">
                  <HandHeart size={16} className="text-[#C97C5D]" /> 100% Handmade
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck size={16} className="text-[#C97C5D]" /> Free All India Delivery
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={16} className="text-[#C97C5D]" /> Quality Inspected
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
