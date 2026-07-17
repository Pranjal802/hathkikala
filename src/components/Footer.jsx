import { Mail, Phone, MapPin, Leaf, Heart, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import logo from '../assets/logo.png';

const QUICK_LINKS = ['Home', 'Shop', 'About', 'Gallery', 'Contact'];
const CATEGORIES_LIST = ['Premium Roses', 'Mixed Bouquets', 'Seasonal Flowers', 'Plant Care', 'Custom Orders', 'Gift Items'];

// ── Social links ── Instagram is live; add the rest here once ready
const SOCIAL_LINKS = [
  { Icon: Instagram, label: 'Instagram', color: 'hover:bg-[#6B8E7F]', href: 'https://www.instagram.com/hathkikala_shop/?hl=en' },
  { Icon: Facebook, label: 'Facebook', color: 'hover:bg-[#7A9B8C]', href: '#' },
  { Icon: Youtube, label: 'Youtube', color: 'hover:bg-[#8AA89A]', href: '#' },
  { Icon: Twitter, label: 'Twitter', color: 'hover:bg-[#9D6B7F]', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#3A3A3A] text-white overflow-hidden relative">
      {/* Top wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 fill-[#F5F1E8]">
          <path d="M0,60 C480,0 960,0 1440,60 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 -left-20 w-48 h-48 bg-[#6B8E7F]/10 blob" />
      <div className="absolute bottom-20 -right-20 w-56 h-56 bg-[#9D6B7F]/10 blob" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-11 h-11 rounded-full bg-[#6B8E7F] flex items-center justify-center shadow-sm overflow-hidden">
                <img src={logo} alt="Hath Ki Kala Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif text-2xl font-light text-[#A8C5B8]"> हाथ की कला</span><br />
                <span className="font-serif text-sm font-light text-white/70">Stories Woven By Hand</span>
              </div>
            </div>
            <p className="font-sans text-sm text-white/60 leading-relaxed mb-6 font-light">
              Curated botanical collections and fresh floral arrangements crafted with love and elegance. Experience the beauty of nature.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href !== '#' ? '_blank' : undefined}
                  rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ${s.color} hover:text-white transition-all hover:-translate-y-1`}
                >
                  <s.Icon size={16} className="text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif text-base font-light text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(link => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="font-sans text-sm text-white/60 hover:text-[#A8C5B8] transition-colors flex items-center gap-2 group font-light"
                  >
                    <span className="w-0 h-0.5 bg-[#6B8E7F] rounded-full group-hover:w-3 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-base font-light text-white mb-5">Shop Categories</h4>
            <ul className="space-y-3">
              {CATEGORIES_LIST.map(cat => (
                <li key={cat}>
                  <a
                    href="#categories"
                    className="font-sans text-sm text-white/60 hover:text-[#A8C5B8] transition-colors flex items-center gap-2 group font-light"
                  >
                    <span className="w-0 h-0.5 bg-[#6B8E7F] rounded-full group-hover:w-3 transition-all duration-300" />
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-light text-white mb-5">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8E7F]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={14} className="text-[#A8C5B8]" />
                </div>
                <div>
                  <div className="font-sans text-xs text-white/40 mb-0.5 font-light">Email</div>
                  <a href="mailto:hello@flowerhub.in" className="font-sans text-sm text-white/70 hover:text-[#A8C5B8] transition-colors font-light">
                    hathkikalashop@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8E7F]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={14} className="text-[#A8C5B8]" />
                </div>
                <div>
                  <div className="font-sans text-xs text-white/40 mb-0.5 font-light">WhatsApp</div>
                  <a href="tel:+91" className="font-sans text-sm text-white/70 hover:text-[#A8C5B8] transition-colors font-light">
                    +91 9313729507
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8E7F]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-[#A8C5B8]" />
                </div>
                <div>
                  <div className="font-sans text-xs text-white/40 mb-0.5 font-light">Based in</div>
                  <span className="font-sans text-sm text-white/70 font-light flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#A8C5B8]" /> India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-white/40 flex items-center gap-1.5 font-light">
            Made with <Heart size={12} className="text-[#A8C5B8] fill-[#A8C5B8]" /> by Hath Ki Kala · © 2024 All rights reserved
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Shipping Policy'].map(link => (
              <a key={link} href="#" className="font-sans text-xs text-white/40 hover:text-[#A8C5B8] transition-colors font-light">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}