import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Sparkles, Eye, ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext.jsx";
import { resolveImageUrl, handleImageError } from "../utils/resolveImageUrl.js";

export default function ProductsSection() {
  const {
    products,
    loadingProducts,
    addToCart,
    setQuickViewProduct,
    toggleWishlist,
    isWishlisted,
    selectedCategory,
    setSelectedCategory,
    fetchProducts,
  } = useStore();

  // Filter ONLY most selling / best-seller products for the homepage
  const bestSellingProducts = products.filter(
    (p) => p.isBestSeller || p.isTrending || (p.badge && /best|top|popular|hot|trending|selling/i.test(p.badge))
  );

  // Fallback to top 6 products if no items are explicitly tagged as bestseller
  const displayProducts = bestSellingProducts.length > 0 ? bestSellingProducts.slice(0, 8) : products.slice(0, 6);

  return (
    <section
      id="products"
      className="py-24 bg-gradient-to-b from-[#F5F1E8] to-white relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-[#EADFD3] opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#DCCFC0] opacity-20 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-[4px] uppercase text-[#6B8E7F] mb-4 font-bold bg-[#E8F0EC] px-4 py-1.5 rounded-full border border-[#D4E2DC]">
            <Flame size={15} className="text-amber-500 fill-amber-500 animate-pulse" />
            Most Selling Creations
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-4 leading-tight">
            Our Top Selling & <br />
            <span className="text-[#7A9B8C]">Most Loved Products</span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          {selectedCategory && (
            <div className="mb-6 flex justify-center items-center gap-2">
              <span className="px-4 py-1.5 bg-[#C97C5D] text-white rounded-full font-bold text-xs">
                Filtered Collection
              </span>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  fetchProducts();
                }}
                className="text-xs text-gray-500 underline font-semibold hover:text-[#C97C5D]"
              >
                Clear Filter
              </button>
            </div>
          )}

          <p className="text-[#5A5A5A] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            Handcrafted favorites loved most by our customers across India. Discover our highest-rated artisanal bestsellers below.
          </p>
        </motion.div>

        {/* Loading State */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="bg-white rounded-3xl h-96 animate-pulse p-6 border border-gray-100 flex flex-col justify-between">
                <div className="w-full h-48 bg-rose-50 rounded-2xl"></div>
                <div className="h-6 bg-gray-100 rounded-xl w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-xl w-1/2"></div>
                <div className="h-10 bg-rose-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-bold text-gray-700">No best-selling products found.</p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group border border-[#EFE7DD] flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="relative h-72 overflow-hidden bg-[#F7F2EB] flex items-center justify-center">
                  {product.thumbnail ? (
                    <img
                      src={resolveImageUrl(product.thumbnail)}
                      onError={handleImageError}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {product.emoji || '🧸'}
                    </span>
                  )}

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-[#9D6B7F] text-white text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                      {product.badge}
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-white transition"
                  >
                    <Heart
                      size={18}
                      className={isWishlisted(product.id) ? "text-rose-500 fill-rose-500" : "text-[#6B8E7F]"}
                    />
                  </button>

                  {/* Quick View Overlay Button */}
                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C97C5D]" /> Quick View
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-[#3A3A3A] mb-2 leading-snug">
                      {product.name}
                    </h3>

                    {/* Stock & Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={14}
                            className="fill-[#D4A017] text-[#D4A017]"
                          />
                        ))}
                        <span className="text-xs text-gray-400 font-bold ml-1">5.0</span>
                      </div>

                      <span className={`text-xs font-bold ${product.inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {product.inStock ? 'In Stock' : 'Made to Order'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Price */}
                    <div className="mb-5 flex items-center gap-2 flex-wrap">
                      <span className="text-2xl font-extrabold text-[#C97C5D]">
                        ₹{product.discountPrice || product.basePrice}
                      </span>
                      {product.discountPrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.basePrice}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full border border-emerald-200">
                            {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Add to Cart & Wishlist Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-[#6B8E7F] hover:bg-[#5A7A6D] text-white py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-md"
                      >
                        <ShoppingCart size={17} />
                        Add to Cart
                      </button>

                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center shadow-sm ${
                          isWishlisted(product.id)
                            ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                            : 'bg-[#F7F2EB] border-gray-200 text-[#6B8E7F] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                        }`}
                        title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart
                          size={18}
                          className={isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : ""}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Explore Full Shop CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#3E2C23] hover:bg-[#C97C5D] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Explore All Products & Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}