import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function CollectionsPage() {
  const { categories, setSelectedCategory, fetchProducts } = useStore();
  const navigate = useNavigate();

  const handleSelectCollection = (catId) => {
    setSelectedCategory(catId);
    fetchProducts({ categoryId: catId });
    navigate('/products');
  };

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-12 px-4 text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> Artisanal Directories
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3">Our Dedicated Collections</h1>
          <p className="font-sans text-sm sm:text-base text-rose-100/90 max-w-2xl mx-auto">
            Explore curated categories: plush crochet companions, ethnic mirror-work clutches, DIY craft kits, and bespoke hampers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#5C4033]/60 mb-8 font-medium">
          <Link to="/" className="hover:text-[#C97C5D]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#3E2C23] font-bold">Collections</span>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectCollection(cat.id)}
              className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 bg-[#F5E6DA] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {cat.icon || '🧸'}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C97C5D]">
                  {cat.slug}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] mt-1 mb-2">
                  {cat.name}
                </h3>
                <p className="font-sans text-xs text-[#5C4033]/70 leading-relaxed mb-4">
                  {cat.description || 'Handmade artisanal creations crafted with passion and fine materials.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#C97C5D] border-t border-rose-50 pt-4">
                <span>View Collection</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
