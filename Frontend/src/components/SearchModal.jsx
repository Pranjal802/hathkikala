import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Frown, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/brand';

export default function SearchModal() {
  const { searchOpen, setSearchOpen, addToCart } = useStore();
  const [query, setQuery] = useState('');

  const results = query.trim().length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSearchOpen(false); setQuery(''); }}
            className="fixed inset-0 bg-[#3E2C23]/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-[#FFF8F2] rounded-3xl shadow-2xl overflow-hidden">
              {/* Search bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5E6DA]">
                <Search size={20} className="text-[#C97C5D] flex-shrink-0" />
                <input
                  id="search-input"
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search handmade products..."
                  className="flex-1 bg-transparent font-sans text-[#3E2C23] placeholder-[#5C4033]/40 focus:outline-none text-base"
                />
                <button
                  onClick={() => { setSearchOpen(false); setQuery(''); }}
                  className="w-8 h-8 rounded-xl bg-[#F5E6DA] flex items-center justify-center text-[#5C4033] hover:bg-[#D8A7B1] hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {query.trim().length < 2 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-[#F5E6DA] rounded-2xl flex items-center justify-center">
                      <Search size={28} className="text-[#C97C5D]/40" />
                    </div>
                    <p className="font-sans text-sm text-[#5C4033]/60">Type to search products, categories...</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['Crochet', 'Slime', 'Mirror Gloves', 'Gift'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="font-sans text-xs bg-[#F5E6DA] text-[#5C4033] px-3 py-1.5 rounded-full hover:bg-[#D8A7B1] hover:text-white transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-[#F5E6DA] rounded-2xl flex items-center justify-center">
                      <Frown size={28} className="text-[#C97C5D]/40" />
                    </div>
                    <p className="font-sans text-sm text-[#5C4033]/60">No results for "<strong>{query}</strong>"</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {results.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5E6DA] transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShoppingBag size={22} className="text-[#C97C5D]/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-[#3E2C23] line-clamp-1">{product.name}</p>
                          <p className="font-sans text-xs text-[#5C4033]/50">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-sans text-sm font-bold text-[#C97C5D]">₹{product.price.toLocaleString()}</p>
                          <button
                            onClick={() => { addToCart(product); setSearchOpen(false); setQuery(''); }}
                            className="font-sans text-xs text-[#9CAF88] hover:text-[#C97C5D] transition-colors"
                          >
                            + Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
