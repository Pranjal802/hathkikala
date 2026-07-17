import { motion } from "framer-motion";
import { Camera } from "lucide-react";

// IMPORT GALLERY IMAGES
import greenBangles from "../assets/green_bangles.jpeg";
import redBangles from "../assets/red.jpeg";
import bridalBangles from "../assets/bridal_bangles.jpeg";
import sareePin from "../assets/saree_pin.jpeg";
import blouse from "../assets/blouse.jpeg";

const GALLERY_ITEMS = [
  {
    id: 1,
    image: greenBangles,
    label: "Elegant Green Bangles",
    category: "Handmade Bangles",
    tall: false,
  },
  {
    id: 2,
    image: bridalBangles,
    label: "Bridal Bangles Collection",
    category: "Traditional Jewelry",
    tall: true,
  },
  {
    id: 3,
    image: redBangles,
    label: "Traditional Red Bangles",
    category: "Festival Collection",
    tall: false,
  },
  {
    id: 4,
    image: sareePin,
    label: "Designer Saree Pin",
    category: "Fashion Accessories",
    tall: false,
  },
  {
    id: 5,
    image: blouse,
    label: "Mirror Work Blouse",
    category: "Embroidery Design",
    tall: true,
  },
  // {
  //   id: 6,
  //   image: purse,
  //   label: "Handmade Thread Purse",
  //   category: "Creative Handcraft",
  //   tall: false,
  // },
];

export default function GallerySection() {
  return (
    <section
      id="gallery"
      className="py-24 bg-gradient-to-b from-white to-[#F7F3EE] relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-52 h-52 bg-[#EADFD3] opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#DCCFC0] opacity-20 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-sm tracking-[5px] uppercase text-[#6B8E7F] mb-4 font-medium">
            <Camera size={14} className="text-[#6B8E7F]" />
            Handmade Gallery
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-6 leading-tight">
            A Collection Of <br />
            <span className="text-[#7A9B8C]">
              Beautiful Handmade Creations
            </span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          <p className="text-[#5A5A5A] max-w-3xl mx-auto text-lg leading-relaxed font-light">
            Explore our handcrafted collection featuring elegant bangles,
            embroidery work, saree pins, purses, and traditional handmade
            accessories designed with creativity and love.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="break-inside-avoid relative overflow-hidden rounded-[32px] shadow-md hover:shadow-2xl group cursor-pointer"
            >
              {/* Image Container */}
              <div
                className={`relative overflow-hidden ${
                  item.tall ? "h-[520px]" : "h-[380px]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                {/* Top Category Badge */}
                <div className="absolute top-5 left-5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full tracking-[2px] uppercase shadow-md">
                  {item.category}
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="font-serif text-2xl text-white mb-3 leading-snug">
                    {item.label}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm tracking-wide">
                      Handmade Collection
                    </span>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
                    >
                      <Camera size={20} className="text-[#6B8E7F]" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}