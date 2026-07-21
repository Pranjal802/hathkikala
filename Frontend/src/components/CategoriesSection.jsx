import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext.jsx";

export default function CategoriesSection() {
  const { categories, fetchProducts, setSelectedCategory, selectedCategory } = useStore();

  const handleSelectCategory = (cat) => {
    if (selectedCategory === cat.id) {
      setSelectedCategory(null);
      fetchProducts();
    } else {
      setSelectedCategory(cat.id);
      fetchProducts({ categoryId: cat.id });
    }
    const elem = document.getElementById('products');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="collections"
      className="py-24 bg-gradient-to-b from-white to-[#F7F4EF] relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-[#F5EBDD] opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-52 h-52 bg-[#DCCFC0] opacity-20 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm tracking-[5px] uppercase text-[#6B8E7F] mb-4 font-medium">
            <Sparkles size={14} className="text-[#6B8E7F]" />
            Our Artisanal Collections
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-4 leading-tight">
            Crafted With Passion <br />
            <span className="text-[#7A9B8C]">& Heritage Beauty</span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          <p className="text-[#5A5A5A] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            Discover our handmade creations: plush crochet toys, mirror work accessories, custom clutches, galaxy slime kits, and bespoke artisanal gifts.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectCategory(cat)}
              className={`relative bg-gradient-to-br from-[#6B8E7F]/90 to-[#9D6B7F]/90 rounded-3xl p-6 text-white overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border ${
                selectedCategory === cat.id ? 'ring-4 ring-[#C97C5D] scale-105' : 'hover:-translate-y-1'
              }`}
            >
              <div className="w-14 h-14 mb-4 bg-white/20 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {cat.icon || '🧸'}
              </div>

              <span className="inline-block text-[10px] tracking-[2px] uppercase text-white/80 mb-1 font-bold">
                {cat.slug?.toUpperCase() || 'COLLECTION'}
              </span>

              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight mb-2">
                {cat.name}
              </h3>

              <p className="text-white/90 text-xs leading-relaxed font-light line-clamp-2">
                {cat.description || 'Handcrafted items built with love & precision.'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}