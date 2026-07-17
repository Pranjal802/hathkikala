import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import purseModel from "../assets/purse_model.png";
import purse2Model from "../assets/purse2_model.png";
import banglesModel from "../assets/bangles_model.png";

// ── Add your slide images here ──
// Keep the first slide (green_bangles) or replace it, then fill in the
// empty src values below with your own imports, e.g.:
//   import basketWeave from "../assets/basket_weave.jpeg";
// then set src: basketWeave
const SLIDES = [
  { src: purse2Model, alt: "Add your image" },
  { src: purseModel, alt: "Handmade Purse" },
  { src: banglesModel, alt: "Add your image" },
];

const AUTOPLAY_MS = 4500;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (next) => {
      setDirection(next > index || (index === SLIDES.length - 1 && next === 0) ? 1 : -1);
      setIndex(next);
    },
    [index]
  );

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (isPaused || SLIDES.length <= 1) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.97 }),
  };

  return (
    <section
      id="home"
      className="bg-gradient-to-br from-[#6B8E7F] via-[#7A9B8C] to-[#8AA89A] py-24 md:py-32 relative overflow-hidden"
    >
      {/* Soft Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
        <img
          src={purseModel}
          alt="Background Decoration"
          className="w-full h-full object-cover rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 text-sm tracking-[4px] uppercase text-white/80 mb-5 font-light">
              <Sparkles size={14} className="text-white/80" /> Handmade Elegance
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Handcrafted Beauty <br />
              For Your Everyday Style
            </h1>

            <p className="text-lg text-white/90 leading-relaxed max-w-xl mb-8 font-light">
              Explore our beautifully handmade collections including bangles,
              baskets, purses, toys, and unique craft items designed with love,
              creativity, and traditional artistry.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-white text-[#6B8E7F] rounded-full font-semibold hover:bg-[#F5F1E8] transition-all duration-300 shadow-md">
                Explore Collection
              </button>

              <button className="px-8 py-3 border border-white text-white rounded-full hover:bg-white/10 transition-all duration-300">
                View Crafts
              </button>
            </div>

            {/* Small Stats */}
            <div className="flex gap-10 mt-12 text-white">
              <div>
                <h3 className="text-3xl font-semibold">100+</h3>
                <p className="text-white/80 text-sm">Handmade Products</p>
              </div>

              <div>
                <h3 className="text-3xl font-semibold">50+</h3>
                <p className="text-white/80 text-sm">Happy Customers</p>
              </div>

              <div>
                <h3 className="text-3xl font-semibold">100%</h3>
                <p className="text-white/80 text-sm">Handcrafted</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full max-w-lg aspect-[4/5]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  {SLIDES[index].src ? (
                    <img
                      src={SLIDES[index].src}
                      alt={SLIDES[index].alt}
                      className="w-full h-full object-cover rounded-[40px] shadow-2xl border border-white/20"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[40px] shadow-2xl border-2 border-dashed border-white/40 bg-white/10 flex items-center justify-center text-center px-8">
                      <p className="text-white/80 text-sm">
                        Add an image path for slide {index + 1} in{" "}
                        <code className="bg-black/20 px-1.5 py-0.5 rounded">SLIDES</code>
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Arrows */}
              {SLIDES.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous slide"
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-[#6B8E7F] shadow-md hover:bg-white transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft size={18} className="sm:hidden" />
                    <ChevronLeft size={20} className="hidden sm:block" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next slide"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-[#6B8E7F] shadow-md hover:bg-white transition-all duration-300 hover:scale-105"
                  >
                    <ChevronRight size={18} className="sm:hidden" />
                    <ChevronRight size={20} className="hidden sm:block" />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {SLIDES.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -bottom-4 left-2 sm:-bottom-6 sm:-left-6 bg-[#DCCFC0] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-xl z-10 max-w-[85%] sm:max-w-none"
              >
                <p className="text-[#6B8E7F] font-semibold text-base sm:text-lg flex items-center gap-2">
                  <Sparkles size={16} className="text-[#6B8E7F] shrink-0 sm:hidden" />
                  <Sparkles size={18} className="text-[#6B8E7F] shrink-0 hidden sm:block" />
                  Premium Handmade
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Crafted with Love & Care
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}