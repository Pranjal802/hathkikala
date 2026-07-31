import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, Filter, SlidersHorizontal, Search, Star, Heart, ShoppingCart, Eye,
  Grid, List, RotateCcw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { resolveImageUrl, handleImageError } from '../utils/resolveImageUrl.js';

export default function ProductsPage() {
  const {
    products,
    categories,
    loadingProducts,
    addToCart,
    setQuickViewProduct,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  // Filters State
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // featured, price_asc, price_desc, rating, newest
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCatId('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(3000);
    setInStockOnly(false);
    setBadgeFilter('all');
    setSortBy('featured');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        if (selectedCatId !== 'all' && product.categoryId !== selectedCatId) {
          return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesDesc = product.description?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        // Price Filter
        const effectivePrice = product.discountPrice || product.basePrice;
        if (effectivePrice < minPrice || effectivePrice > maxPrice) {
          return false;
        }

        // In Stock Filter
        if (inStockOnly && !product.inStock) {
          return false;
        }

        // Badge Filter
        if (badgeFilter !== 'all' && product.badge !== badgeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.basePrice;
        const priceB = b.discountPrice || b.basePrice;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0; // featured
      });
  }, [products, selectedCatId, searchQuery, minPrice, maxPrice, inStockOnly, badgeFilter, sortBy]);

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-12 px-4 text-center relative overflow-hidden mb-8">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> Artisanal Catalog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3">Explore Handmade Treasures</h1>
          <p className="font-sans text-sm sm:text-base text-rose-100/90 max-w-2xl mx-auto">
            Discover handcrafted crochet plushies, traditional mirror-work clutches, sensory slime kits, and bespoke hampers built with love.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5C4033]/60 mb-6 font-medium">
          <Link to="/" className="hover:text-[#C97C5D] transition">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#3E2C23] font-bold">Shop</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTERS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-6">
              
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <h3 className="font-serif text-lg font-bold text-[#3E2C23] flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#C97C5D]" /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#5C4033]/60 hover:text-[#C97C5D] flex items-center gap-1 transition"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bear, clutch, slime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F5E6DA]/50 pl-9 pr-4 py-2.5 rounded-xl font-sans text-xs font-medium text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-2">
                  Collection / Category
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full bg-[#F5E6DA]/50 pl-3 pr-8 py-2.5 rounded-xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || '📦'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#3E2C23] uppercase tracking-wider">
                    Price Range (₹)
                  </label>
                  <span className="text-xs font-extrabold text-[#C97C5D]">
                    ₹{minPrice} - ₹{maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C97C5D] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#5C4033]/50 font-bold mt-1">
                  <span>₹0</span>
                  <span>₹1,500</span>
                  <span>₹3,000+</span>
                </div>
              </div>

              {/* Availability Checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3E2C23]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C97C5D] focus:ring-[#C97C5D]"
                  />
                  <span>Ready In Stock Only</span>
                </label>
              </div>

              {/* Tag / Badge Filter */}
              <div>
                <label className="block text-xs font-bold text-[#3E2C23] uppercase tracking-wider mb-2">
                  Artisanal Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Best Seller', 'Trending', 'Limited Edition', 'Made to Order', 'Cute Pick'].map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setBadgeFilter(badge)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                        badgeFilter === badge
                          ? 'bg-[#C97C5D] text-white border-[#C97C5D]'
                          : 'bg-[#F5E6DA]/50 text-[#3E2C23] border-transparent hover:bg-[#F5E6DA]'
                      }`}
                    >
                      {badge === 'all' ? 'All Tags' : badge}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* MAIN PRODUCT CATALOG */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="font-sans text-xs font-bold text-[#3E2C23]">
                Showing <strong className="text-[#C97C5D]">{filteredProducts.length}</strong> of {products.length} Products
              </span>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#5C4033]/70">Sort By:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F5E6DA]/50 pl-3 pr-8 py-1.5 rounded-xl font-sans text-xs font-bold text-[#3E2C23] focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                  >
                    <option value="featured">Featured Artisanal</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated (5★)</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-[#F5E6DA]/50 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-[#C97C5D]' : 'text-gray-400'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-[#C97C5D]' : 'text-gray-400'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div key={sk} className="bg-white rounded-3xl h-80 animate-pulse p-6 border border-gray-100"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-4">
                <div className="w-16 h-16 bg-[#F5E6DA] rounded-full flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3E2C23]">No products match your active filters</h3>
                <p className="font-sans text-xs text-[#5C4033]/60">Try adjusting your price range, search query, or tag selections.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold text-xs rounded-xl shadow hover:bg-[#b0674a] transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod, i) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-100 group flex flex-col justify-between"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-[#F5E6DA]/50 to-[#FDEEE4]/50 flex items-center justify-center overflow-hidden">
                      {prod.thumbnail ? (
                        <img src={resolveImageUrl(prod.thumbnail)} onError={handleImageError} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{prod.emoji || '🧸'}</span>
                      )}

                      {prod.badge && (
                        <span className="absolute top-3 right-3 bg-[#C97C5D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {prod.badge}
                        </span>
                      )}

                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="absolute top-3 left-3 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition"
                      >
                        <Heart size={16} className={isWishlisted(prod.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'} />
                      </button>

                      <button
                        onClick={() => setQuickViewProduct(prod)}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5"
                      >
                        <Eye size={14} className="text-[#C97C5D]" /> Quick View
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <Link to={`/product/${prod.slug}`} className="font-serif text-lg font-bold text-[#3E2C23] hover:text-[#C97C5D] transition line-clamp-1">
                          {prod.name}
                        </Link>
                        <p className="font-sans text-xs text-[#5C4033]/60 line-clamp-2 mt-1">{prod.description}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} size={12} className="fill-[#D4A017] text-[#D4A017]" />
                            ))}
                            <span className="text-[11px] font-bold text-gray-400 ml-1">5.0</span>
                          </div>
                          <span className={`text-[10px] font-bold ${prod.inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {prod.inStock ? 'In Stock' : 'Made to Order'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-sans text-xl font-extrabold text-[#C97C5D]">
                              ₹{prod.discountPrice || prod.basePrice}
                            </span>
                            {prod.discountPrice && (
                              <span className="font-sans text-xs text-gray-400 line-through">
                                ₹{prod.basePrice}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setQuickViewProduct(prod)}
                              className="bg-[#F5E6DA] hover:bg-[#C97C5D] text-[#3E2C23] hover:text-white p-2.5 rounded-xl transition shadow-sm flex items-center justify-center"
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => addToCart(prod)}
                              className="bg-[#3E2C23] hover:bg-[#C97C5D] text-white px-3 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold"
                            >
                              <ShoppingCart size={16} /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 bg-rose-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {prod.thumbnail ? <img src={resolveImageUrl(prod.thumbnail)} onError={handleImageError} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">{prod.emoji || '🧸'}</span>}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link to={`/product/${prod.slug}`} className="font-serif text-xl font-bold text-[#3E2C23] hover:text-[#C97C5D] transition">
                          {prod.name}
                        </Link>
                        {prod.badge && <span className="bg-[#C97C5D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{prod.badge}</span>}
                      </div>

                      <p className="font-sans text-xs text-[#5C4033]/70">{prod.description}</p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <span>⭐ 5.0 Rating</span>
                        <span>•</span>
                        <span className={prod.inStock ? 'text-emerald-600' : 'text-rose-500'}>{prod.inStock ? 'In Stock' : 'Made to Order'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-3">
                      <div className="font-sans text-2xl font-extrabold text-[#C97C5D]">
                        ₹{prod.discountPrice || prod.basePrice}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuickViewProduct(prod)}
                          className="px-4 py-2.5 bg-rose-50 text-[#C97C5D] hover:bg-rose-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <Eye size={15} /> Quick View
                        </button>
                        <button
                          onClick={() => addToCart(prod)}
                          className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold text-xs rounded-xl shadow hover:bg-[#b0674a] transition flex items-center gap-2"
                        >
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
