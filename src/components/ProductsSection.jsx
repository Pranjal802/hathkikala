import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Sparkles } from "lucide-react";

import greenBangles from "../assets/green_bangles.jpeg";
import redBangles from "../assets/red.jpeg";
import bridalBangles from "../assets/bridal_bangles.jpeg";
import sareePin from "../assets/saree_pin.jpeg";
import blouse from "../assets/blouse.jpeg";

const PRODUCTS = [
  {
    id: 1,
    name: "Elegant Green Bangles",
    price: "Price will be announced soon",
    image: greenBangles,
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Traditional Red Bangles",
    price: "Price will be announced soon",
    image: redBangles,
    rating: 4.8,
    reviews: 98,
    badge: "Trending",
  },
  {
    id: 3,
    name: "Bridal Handmade Bangles",
    price: "Price will be announced soon",
    image: bridalBangles,
    rating: 5.0,
    reviews: 76,
    badge: "Premium",
  },
  {
    id: 4,
    name: "Designer Pen",
    price: "Price will be announced soon",
    image: sareePin,
    rating: 4.7,
    reviews: 54,
    badge: "Popular",
  },
  {
    id: 5,
    name: "Mirror Work Blouse",
    price: "Price will be announced soon",
    image: blouse,
    rating: 4.9,
    reviews: 63,
    badge: "New",
  },
];

export default function ProductsSection() {
  return (
    <section
      id="products"
      className="py-24 bg-gradient-to-b from-[#F5F1E8] to-white relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-[#EADFD3] opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#DCCFC0] opacity-20 blur-3xl rounded-full"></div>

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
            Featured Handmade Products
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-6 leading-tight">
            Crafted With Love & <br />
            <span className="text-[#7A9B8C]">Traditional Elegance</span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          <p className="text-[#5A5A5A] max-w-3xl mx-auto text-lg leading-relaxed font-light">
            Discover our premium handmade collections including elegant
            bangles, mirror work blouses, designer saree pins, and beautifully
            crafted traditional accessories.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group border border-[#EFE7DD]"
            >
              {/* Product Image */}
              <div className="relative h-80 overflow-hidden bg-[#F7F2EB]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Badge */}
                <div className="absolute top-4 right-4 bg-[#9D6B7F] text-white text-xs px-4 py-1.5 rounded-full tracking-[2px] uppercase shadow-md">
                  {product.badge}
                </div>

                {/* Wishlist */}
                <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white transition">
                  <Heart
                    size={18}
                    className="text-[#6B8E7F] hover:fill-[#6B8E7F]"
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Product Name */}
                <h3 className="font-serif text-2xl text-[#3A3A3A] mb-3 leading-snug">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={15}
                      className={
                        index < Math.floor(product.rating)
                          ? "fill-[#D4A017] text-[#D4A017]"
                          : "text-[#DDD]"
                      }
                    />
                  ))}

                  <span className="text-sm text-[#777] ml-2">
                    ({product.reviews} Reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-sm font-medium text-[#9D6B7F] italic">
                    {product.price}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#6B8E7F] text-white py-3 rounded-xl hover:bg-[#5A7A6D] transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>

                  <button className="px-4 border border-[#6B8E7F] text-[#6B8E7F] rounded-xl hover:bg-[#6B8E7F]/10 transition-all duration-300">
                    <Heart size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}