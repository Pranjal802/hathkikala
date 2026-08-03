import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useStore } from "../context/StoreContext.jsx";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  PackageCheck,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const BRAND_NAME = "हाथ की कला";
const TAGLINE = "Stories Woven By Hand";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  { name: "Collections", path: "/#collections", targetId: "collections" },
  { name: "About", path: "/#about", targetId: "about" },
  { name: "Contact", path: "/#contact", targetId: "contact" },
];

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  const {
    user,
    logout,
    cartCount,
    setCartOpen,
    setSearchOpen,
    setLoginOpen,
  } = useStore();

  return (
    <nav className="sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo + wordmark */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
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
        </Link>

        {/* Desktop Router Nav Links */}
        <div className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={(e) => {
                if (link.targetId) {
                  const el = document.getElementById(link.targetId);
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              className={({ isActive }) =>
                `relative text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-[#C97C5D] font-bold" : "text-[#5A5A5A] hover:text-[#4F6B5C]"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105"
          >
            <Search size={19} />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0] hover:scale-105"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9D6B7F] text-[10px] font-bold text-white ring-2 ring-[#F5F1E8]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Profile / Login */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-xs font-bold text-[#C97C5D] hover:bg-rose-100 transition"
              >
                <User className="w-3.5 h-3.5" /> {user.name?.split(' ')[0] || 'Account'}
              </button>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="px-4 py-1.5 bg-[#6B8E7F] text-white font-bold rounded-full text-xs hover:bg-[#4F6B5C] transition shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Account Dropdown */}
            {accountMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-800 truncate">{user.name || user.email}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setAccountMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#C97C5D]" /> My Profile & Addresses
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setAccountMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-[#C97C5D]" /> My Orders
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setAccountMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-[#C97C5D] hover:bg-rose-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Studio
                  </Link>
                )}

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100 mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-[#6B8E7F] transition-all duration-300 hover:bg-[#E8DDD0]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <BlockPrintRule />

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 border-b border-[#E8DDD0]" : "max-h-0"
        }`}
      >
        <div className="bg-[#F5F1E8] px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={(e) => {
                setIsOpen(false);
                if (link.targetId) {
                  const el = document.getElementById(link.targetId);
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[#C97C5D] font-bold" : "text-[#5A5A5A]"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <NavLink
            to="/orders"
            onClick={() => setIsOpen(false)}
            className="text-sm font-medium text-[#5A5A5A]"
          >
            My Orders
          </NavLink>
        </div>
      </div>
    </nav>
  );
}