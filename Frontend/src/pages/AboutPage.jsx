import { motion } from 'framer-motion';
import { Heart, Sparkles, ShieldCheck, Award, HandHeart, Users } from 'lucide-react';
import AboutUs from '../components/AboutUs.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';

export default function AboutPage() {
  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-16 px-4 text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> Our Artisanal Story
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">About Hath Ki Kala</h1>
          <p className="font-sans text-sm sm:text-base text-rose-100/90 max-w-2xl mx-auto leading-relaxed">
            Hath Ki Kala (हाथ की कला) was born out of a deep love for Indian heritage, traditional craftsmanship, and bespoke handmade artistry.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Story Section */}
        <AboutUs />

        {/* Core Values Grid */}
        <div className="bg-white p-8 sm:p-12 rounded-4xl border border-rose-100 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-[#3E2C23] mb-2">Why Hath Ki Kala?</h2>
            <p className="font-sans text-xs text-[#5C4033]/60 uppercase tracking-widest font-bold">Our Pillars of Craftsmanship</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#F5E6DA]/30 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#C97C5D] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <HandHeart size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3E2C23]">100% Handstitched</h3>
              <p className="font-sans text-xs text-[#5C4033]/70">Every plushie, clutch, and accessory is built by hand with yarn and thread.</p>
            </div>

            <div className="p-6 bg-[#F5E6DA]/30 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#9CAF88] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3E2C23]">Non-Toxic & Safe</h3>
              <p className="font-sans text-xs text-[#5C4033]/70">Skin-friendly yarn, organic cotton, and safe slime ingredients.</p>
            </div>

            <div className="p-6 bg-[#F5E6DA]/30 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#D8A7B1] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Award size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3E2C23]">Custom Tailoring</h3>
              <p className="font-sans text-xs text-[#5C4033]/70">Custom colors, custom names, and personalized hampers on request.</p>
            </div>

            <div className="p-6 bg-[#F5E6DA]/30 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 bg-[#3E2C23] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Users size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3E2C23]">Artisan Community</h3>
              <p className="font-sans text-xs text-[#5C4033]/70">Empowering local female artisans and preserving traditional handicraft.</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <TestimonialsSection />

      </div>
    </div>
  );
}
