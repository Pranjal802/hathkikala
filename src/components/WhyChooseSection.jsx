import { motion } from 'framer-motion';
import { HandHeart, Heart, Star, Palette, Tag, Leaf } from 'lucide-react';
import { WHY_CHOOSE } from '../data/brand';

const ICON_MAP = {
  HandHeart: <HandHeart size={28} />,
  Heart: <Heart size={28} />,
  Star: <Star size={28} />,
  Palette: <Palette size={28} />,
  Tag: <Tag size={28} />,
  Leaf: <Leaf size={28} />,
};

export default function WhyChooseSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#F5E6DA] via-[#FFF8F2] to-[#F5E6DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 font-sans text-sm font-medium text-[#C97C5D] bg-white px-4 py-1.5 rounded-full mb-4 shadow-soft">
            <Star size={14} className="text-[#C97C5D]" />
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#3E2C23] mb-4">
            The <span className="text-gradient italic">Handmade</span> Difference
          </h2>
          <p className="font-sans text-[#5C4033]/70 max-w-xl mx-auto">
            When you buy from us, you're not just shopping — you're supporting a home-based artist who pours heart into every creation.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {WHY_CHOOSE.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group bg-white rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-hover transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-[#C97C5D]/15 to-[#D8A7B1]/20 rounded-2xl flex items-center justify-center text-[#C97C5D] shadow-soft group-hover:scale-110 transition-transform duration-300">
                {ICON_MAP[item.icon]}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3E2C23] mb-2">{item.title}</h3>
              <p className="font-sans text-sm text-[#5C4033]/70 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
