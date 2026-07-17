// import { useState } from "react";
// import logo from "../assets/logo.png";
// import {
//   Menu,
//   X,
//   Search,
//   ShoppingCart,
//   Heart,
//   Sparkles,
// } from "lucide-react";

// const NAV_LINKS = [
//   { name: "Home", href: "#home" },
//   { name: "Collections", href: "#collections" },
//   { name: "Products", href: "#products" },
//   { name: "About", href: "#about" },
//   { name: "Gallery", href: "#gallery" },
//   { name: "Contact", href: "#contact" },
// ];

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="sticky top-0 z-50 border-b border-[#E8DDD0] bg-[#F5F1E8]/90 backdrop-blur-md shadow-sm">
      
//       <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

//         {/* Logo */}
//         <div className="flex items-center gap-3 cursor-pointer group">
          
//           <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6B8E7F] to-[#8AA89A] shadow-md transition-transform duration-300 group-hover:scale-105 overflow-hidden">
//             <img src={logo} alt="Hath Ki Kala Logo" className="w-full h-full object-cover" />
//           </div>

//           <div>
//             <h2 className="font-serif text-xl text-[#3A3A3A] leading-none">
//               हाथ की कला
//             </h2>

//             {/* <span className="text-[11px] uppercase tracking-[2px] text-[#6B8E7F] font-serif">
//               हाथ की कला
//             </span> */}
//           </div>
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center gap-8">

//           {NAV_LINKS.map((link) => (
//             <a
//               key={link.name}
//               href={link.href}
//               className="relative text-sm font-medium text-[#5A5A5A] transition-colors duration-300 hover:text-[#6B8E7F] group"
//             >
//               {link.name}

//               {/* Underline Hover */}
//               <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#6B8E7F] transition-all duration-300 group-hover:w-full rounded-full"></span>
//             </a>
//           ))}
//         </div>

//         {/* Right Icons */}
//         <div className="flex items-center gap-2 sm:gap-3">

//           {/* Search */}
//           <button className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105">
//             <Search size={19} className="text-[#6B8E7F]" />
//           </button>

//           {/* Wishlist */}
//           <button className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105">
//             <Heart size={19} className="text-[#6B8E7F]" />
//           </button>

//           {/* Cart */}
//           <button className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105">
//             <ShoppingCart size={19} className="text-[#6B8E7F]" />

//             <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9D6B7F] text-[10px] font-bold text-white">
//               0
//             </span>
//           </button>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="md:hidden flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#E8DDD0]"
//           >
//             {isOpen ? (
//               <X size={24} className="text-[#6B8E7F]" />
//             ) : (
//               <Menu size={24} className="text-[#6B8E7F]" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div
//         className={`md:hidden overflow-hidden transition-all duration-500 ${
//           isOpen ? "max-h-96 border-t border-[#E8DDD0]" : "max-h-0"
//         }`}
//       >
//         <div className="bg-[#F5F1E8] px-6 py-5 flex flex-col gap-5">

//           {NAV_LINKS.map((link) => (
//             <a
//               key={link.name}
//               href={link.href}
//               onClick={() => setIsOpen(false)}
//               className="group relative w-fit text-[#5A5A5A] text-sm font-medium transition-colors duration-300 hover:text-[#6B8E7F]"
//             >
//               {link.name}

//               {/* Underline */}
//               <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#6B8E7F] transition-all duration-300 group-hover:w-full rounded-full"></span>
//             </a>
//           ))}
//         </div>
//       </div>
//     </nav>
//   );
// }
import { useState } from "react";
import logo from "../assets/logo.png";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
} from "lucide-react";

// ── Swap these two to try a different brand direction ──
const BRAND_NAME = "हाथ की कला";
const TAGLINE = "Stories Woven By Hand"; // "stories woven by hand"
// Other name options to try: कारीगर · हस्तकला · हाथों की कहानी · कलाघर

const NAV_LINKS = [
  { name: "Home", href: "#home" },
  { name: "Collections", href: "#collections" },
  { name: "Products", href: "#products" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#contact" },
];

// Small repeating diamond motif — a nod to Indian block-print borders,
// used as a one-pixel-tall signature rule under the navbar.
function BlockPrintRule() {
  return (
    <div
      className="h-[6px] w-full opacity-70"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #C9A227 25%, transparent 25%), linear-gradient(225deg, #C9A227 25%, transparent 25%), linear-gradient(45deg, #C9A227 25%, transparent 25%), linear-gradient(315deg, #C9A227 25%, transparent 25%)",
        backgroundPosition: "6px 0, 6px 0, 0 0, 0 0",
        backgroundSize: "12px 12px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F1E8]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + wordmark */}
        <a href="#home" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6B8E7F] to-[#4F6B5C] shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg overflow-hidden ring-1 ring-[#C9A227]/40">
            <img src={logo} alt={`${BRAND_NAME} logo`} className="w-full h-full object-cover" />
          </div>

          <div className="leading-tight">
            <h2 className="font-serif text-2xl tracking-wide bg-gradient-to-r from-[#4F6B5C] via-[#6B8E7F] to-[#9D6B7F] bg-clip-text text-transparent group-hover:from-[#9D6B7F] group-hover:to-[#4F6B5C] transition-all duration-500">
              {BRAND_NAME}
            </h2>
            <span className="hidden sm:block text-[11px] italic text-[#9D6B7F] tracking-wide">
              {TAGLINE}
            </span>
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium text-[#5A5A5A] transition-colors duration-300 hover:text-[#4F6B5C] group"
            >
              {link.name}
              <span className="absolute left-1/2 -bottom-1.5 h-[2px] w-0 -translate-x-1/2 bg-[#C9A227] transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105"
          >
            <Search size={19} />
          </button>

          <button
            aria-label="Wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105"
          >
            <Heart size={19} />
          </button>

          <button
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105"
          >
            <ShoppingCart size={19} />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9D6B7F] text-[10px] font-bold text-white ring-2 ring-[#F5F1E8]">
              0
            </span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Signature block-print rule */}
      <BlockPrintRule />

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 border-b border-[#E8DDD0]" : "max-h-0"
        }`}
      >
        <div className="bg-[#F5F1E8] px-6 py-5 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="group relative w-fit text-[#5A5A5A] text-sm font-medium transition-colors duration-300 hover:text-[#4F6B5C]"
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C9A227] transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}