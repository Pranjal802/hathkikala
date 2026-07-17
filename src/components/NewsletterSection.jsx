import { motion } from "framer-motion";
import { Mail, Sparkles } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-white to-[#F7F3EE] py-16 sm:py-20">
      
      {/* Decorative Glow */}
      <div className="absolute top-10 left-10 h-44 w-44 rounded-full bg-[#EADFD3] opacity-30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-[#DCCFC0] opacity-20 blur-3xl"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#6B8E7F] via-[#7A9B8C] to-[#8AA89A] px-6 py-12 sm:px-12 sm:py-14 text-white shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-[#F5EBDD]/20 blur-3xl"></div>

          {/* Top Icon */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md"
          >
            <Sparkles size={28} className="text-[#F5EBDD]" />
          </motion.div>

          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center">

            <span className="mb-4 inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[4px] text-[#F5EBDD]">
              <Sparkles size={12} className="text-[#F5EBDD]" /> Stay Connected
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5">
              Get Exclusive Handmade
              <br />
              Collections & Updates
            </h2>

            <p className="mb-8 text-base sm:text-lg leading-8 text-white/90">
              Subscribe to receive updates about our latest handmade
              collections, festive launches, exclusive accessories,
              and handcrafted designs.
            </p>
          </div>

          {/* Form */}
          <form className="mx-auto max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-4">

              {/* Input */}
              <div className="relative flex-1">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70"
                  size={18}
                />

                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full rounded-full border border-white/20 bg-white/15 py-3.5 pl-14 pr-5 text-white placeholder:text-white/70 backdrop-blur-md transition-all duration-300 focus:border-[#F5EBDD] focus:outline-none"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="whitespace-nowrap rounded-full bg-[#F5EBDD] px-7 py-3.5 font-semibold text-[#6B8E7F] shadow-xl transition-all duration-300 hover:bg-white hover:scale-[1.02]"
              >
                Subscribe Now
              </button>
            </div>
          </form>

            <div className="mt-6 text-center">
              <p className="text-sm tracking-wide text-white/75 flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-white/75" /> No spam, only handmade updates & special offers.
              </p>
            </div>
        </motion.div>
      </div>
    </section>
  );
}