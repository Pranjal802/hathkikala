import { motion } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  CircleDot,
  Pin,
  Package,
  Scissors,
} from "lucide-react";

const ICON_MAP = {
  ShoppingBag: ShoppingBag,
  Sparkles: Sparkles,
  CircleDot: CircleDot,
  Pin: Pin,
  Package: Package,
  Scissors: Scissors,
};

const CATEGORIES = [
  {
    id: 1,
    name: "Handmade Purses",
    icon: "ShoppingBag",
    color: "from-[#6B8E7F] to-[#7A9B8C]",
    label: "HANDCRAFTED",
    desc: "Elegant handmade purses crafted with threads, beads, and unique artistic detailing.",
  },
  {
    id: 2,
    name: "Mirror Work Blouses",
    icon: "Sparkles",
    color: "from-[#9D6B7F] to-[#B07B90]",
    label: "EMBROIDERY",
    desc: "Traditional embroidery and mirror work designs for stylish ethnic fashion.",
  },
  {
    id: 3,
    name: "Handmade Bangles",
    icon: "CircleDot",
    color: "from-[#7A9B8C] to-[#9FB3A8]",
    label: "JEWELRY",
    desc: "Beautiful handcrafted bangles designed with vibrant colors and premium detailing.",
  },
  {
    id: 4,
    name: "Saree Pins",
    icon: "Pin",
    color: "from-[#C5A8A3] to-[#B8999E]",
    label: "ACCESSORIES",
    desc: "Stylish saree pins made to add elegance and charm to your traditional outfits.",
  },
  {
    id: 5,
    name: "Decorative Baskets",
    icon: "Package",
    color: "from-[#8AA89A] to-[#A8BDAF]",
    label: "HOME DECOR",
    desc: "Creative handmade baskets perfect for gifting, organizing, and decorating spaces.",
  },
  {
    id: 6,
    name: "Creative Handmade Crafts",
    icon: "Scissors",
    color: "from-[#A8798B] to-[#C5A8A3]",
    label: "ART & CRAFT",
    desc: "Unique handmade creations made with passion, creativity, and traditional artistry.",
  },
];

export default function CategoriesSection() {
  return (
    <section
      id="shop"
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
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-sm tracking-[5px] uppercase text-[#6B8E7F] mb-4 font-medium">
            <Sparkles size={14} className="text-[#6B8E7F]" />
            Our Handmade Collections
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-6 leading-tight">
            Crafted With Creativity <br />
            <span className="text-[#7A9B8C]">& Traditional Elegance</span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          <p className="text-[#5A5A5A] max-w-3xl mx-auto text-lg leading-relaxed font-light">
            Discover our unique handmade collections featuring embroidery,
            mirror work, handcrafted accessories, stylish purses, decorative
            baskets, bangles, and many more beautiful creations made with love.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative bg-gradient-to-br ${cat.color} rounded-[32px] p-8 text-white overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500`}
              >
                {/* Decorative Blur */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                {/* Icon */}
                <div className="w-20 h-20 mb-6 bg-white/20 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-md">
                  <Icon size={40} className="text-white" />
                </div>

                {/* Label */}
                <span className="inline-block text-xs tracking-[4px] uppercase text-white/80 mb-3">
                  {cat.label}
                </span>

                {/* Title */}
                <h3 className="font-serif text-3xl leading-snug mb-4">
                  {cat.name}
                </h3>

                {/* Description */}
                <p className="text-white/90 text-sm leading-relaxed font-light mb-6">
                  {cat.desc}
                </p>

                {/* Button */}
                <button className="px-5 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-sm hover:bg-white/25 transition-all duration-300">
                  Explore Collection →
                </button>

                {/* Bottom Glow Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}