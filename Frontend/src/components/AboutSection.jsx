import { motion } from 'framer-motion';
import { Heart, Award, Palette, Sparkles, Scissors, Flower2, Ribbon, Leaf, Gem, Star } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: <Heart size={20} />, text: 'Made with love from home' },
  { icon: <Award size={20} />, text: 'Premium quality materials' },
  { icon: <Palette size={20} />, text: 'Custom & personalized orders' },
  { icon: <Sparkles size={20} />, text: '2000+ happy customers' },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Icon decorations replacing emojis — floating around the visual card
const DECORATION_ICONS = [
  { icon: Flower2, color: 'text-[#D8A7B1]', size: 28 },
  { icon: Scissors, color: 'text-[#9CAF88]', size: 24 },
  { icon: Gem, color: 'text-[#C97C5D]', size: 26 },
  { icon: Star, color: 'text-[#D4A373]', size: 24 },
  { icon: Leaf, color: 'text-[#9CAF88]', size: 28 },
  { icon: Heart, color: 'text-[#D8A7B1]', size: 22 },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#FFF8F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Blob background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#D8A7B1]/20 to-[#9CAF88]/20 blob"
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full bg-[#D8A7B1]/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Main visual */}
            <motion.div
              className="relative bg-gradient-to-br from-[#F5E6DA] to-[#FDEEE4] rounded-4xl p-10 shadow-card border border-white/60"
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >              {/* Workspace illustration */}
              <div className="text-center">
                {/* Main center icon */}
                <motion.div
                  className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] rounded-3xl flex items-center justify-center shadow-lg"
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Gem size={60} className="text-white" />
                </motion.div>

                {/* Tool icons row */}
                <div className="flex justify-center gap-4 mb-6">
                  {[Scissors, Gem, Flower2, Ribbon].map((Icon, i) => (
                    <motion.div
                      key={i}
                      className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-soft"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <Icon size={24} className="text-[#C97C5D]" />
                    </motion.div>
                  ))}
                </div>

                {/* Mini card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                  <div className="font-serif text-lg font-bold text-[#3E2C23] mb-1">
                    "Every piece tells a story"
                  </div>
                  <p className="font-sans text-xs text-[#5C4033]/70">
                    Handcrafted from home with passion & love
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decoration icons */}
            {DECORATION_ICONS.map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={i}
                  className={`absolute select-none pointer-events-none ${d.color}`}
                  style={{
                    top: `${['-5%', '85%', '40%', '-8%', '90%', '50%'][i]}`,
                    left: `${['85%', '80%', '-8%', '-5%', '-10%', '90%'][i]}`,
                  }}
                  animate={{ y: [0, -10, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
                >
                  <Icon size={d.size} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 font-sans text-sm font-medium text-[#C97C5D] bg-[#F5E6DA] px-4 py-1.5 rounded-full mb-6">
              <Heart size={14} className="text-[#C97C5D] fill-[#C97C5D]" />
              Our Story
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#3E2C23] leading-tight mb-6">
              Crafted from Home,<br />
              <span className="text-gradient italic">Made with Heart</span>
            </h2>

            <p className="font-sans text-[#5C4033]/80 leading-relaxed mb-6">
              Hi! I'm a passionate handmade artist who started this little brand from the cozy corner of my home. Every single product you see is handcrafted by me with the finest materials — sewn, crocheted, and decorated with immense love.
            </p>
            <p className="font-sans text-[#5C4033]/80 leading-relaxed mb-10">
              My dream is to bring a little handmade magic into your everyday life — whether it's a crochet toy that makes you smile, a mirror purse that turns heads, or a slime kit that sparks joy. Each order is packed with care and a tiny love note, just for you.
            </p>

            {/* Highlight pills */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {HIGHLIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 bg-[#F5E6DA]/60 rounded-2xl px-4 py-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {h.icon}
                  </div>
                  <span className="font-sans text-xs font-medium text-[#3E2C23]">{h.text}</span>
                </motion.div>
              ))}
            </div>

            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white px-7 py-4 rounded-full font-sans font-semibold shadow-card hover:shadow-hover hover:-translate-y-1 transition-all"
            >
              <Sparkles size={18} />
              Shop Our Creations
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
