import { motion } from "framer-motion";
import { Star, Quote, User, CircleDot, ShoppingBag, Flower2, Sparkles } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarohi Patel",
    role: "Fashion Enthusiast",
    text: "The handmade bangles are absolutely beautiful and premium. The detailing, colors, and finishing are even better in real life. Everyone keeps asking where I bought them from!",
    avatarColor: "bg-[#6B8E7F]",
    productIcon: <CircleDot size={32} className="text-[#6B8E7F]" />,
    productBg: "bg-[#6B8E7F]/10",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Bride To Be",
    text: "I ordered bridal bangles and a mirror work blouse for my wedding functions. The craftsmanship was stunning and perfectly matched my outfits. Truly handmade elegance!",
    avatarColor: "bg-[#9D6B7F]",
    productIcon: <Sparkles size={32} className="text-[#9D6B7F]" />,
    productBg: "bg-[#9D6B7F]/10",
    rating: 5,
  },
  {
    id: 3,
    name: "Neha Joshi",
    role: "Regular Customer",
    text: "The saree pins and handmade purses are so unique and classy. The quality is amazing and the products feel very premium. Loved every detail of the packaging too.",
    avatarColor: "bg-[#C97C5D]",
    productIcon: <ShoppingBag size={32} className="text-[#C97C5D]" />,
    productBg: "bg-[#C97C5D]/10",
    rating: 5,
  },
  {
    id: 4,
    name: "Riya Mehta",
    role: "Ethnic Wear Creator",
    text: "Beautiful handcrafted products with a traditional touch. The embroidery work and handmade accessories are elegant, creative, and perfect for festive occasions.",
    avatarColor: "bg-[#D4A373]",
    productIcon: <Flower2 size={32} className="text-[#D4A373]" />,
    productBg: "bg-[#D4A373]/10",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#F5F1E8] to-white relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-20 -left-20 w-60 h-60 bg-[#6B8E7F]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 -right-20 w-72 h-72 bg-[#DCCFC0]/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-sm tracking-[5px] uppercase text-[#6B8E7F] mb-4 font-medium">
            <Star size={14} className="text-[#6B8E7F] fill-[#6B8E7F]" />
            Customer Reviews
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A3A3A] mb-6 leading-tight">
            What Our Customers <br />
            <span className="text-[#7A9B8C]">Say About Our Creations</span>
          </h2>

          <div className="w-24 h-1 bg-[#7A9B8C] mx-auto rounded-full mb-6"></div>

          <p className="text-[#5A5A5A] max-w-3xl mx-auto text-lg leading-relaxed font-light">
            Hear from our happy customers who loved our handmade bangles,
            embroidery work, saree pins, purses, and handcrafted accessories.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[32px] p-8 shadow-md hover:shadow-2xl transition-all duration-500 relative overflow-hidden border border-[#EFE7DD]"
            >
              {/* Decorative Blur */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F5EBDD] opacity-30 blur-3xl rounded-full"></div>

              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote size={50} className="text-[#6B8E7F]" />
              </div>

              {/* Product Icon */}
              <div className={`w-14 h-14 rounded-2xl ${testimonial.productBg} flex items-center justify-center mb-6`}>
                {testimonial.productIcon}
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className="fill-[#D4A017] text-[#D4A017]"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-[#5A5A5A] leading-[2] italic font-light mb-8 text-[15px]">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-[#EFE7DD]">
                <div className={`w-14 h-14 rounded-full ${testimonial.avatarColor} flex items-center justify-center shadow-sm`}>
                  <User size={24} className="text-white" />
                </div>

                <div>
                  <h4 className="font-serif text-lg text-[#3A3A3A]">
                    {testimonial.name}
                  </h4>

                  <p className="text-sm text-[#777] tracking-wide">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 pt-16 border-t border-[#E8DDD0]"
        >
          <div className="text-center bg-white rounded-[28px] py-8 px-6 shadow-md border border-[#EFE7DD] flex flex-col justify-center items-center">
            <div className="text-5xl font-serif text-[#6B8E7F] mb-1 flex items-center justify-center gap-1.5">
              4.9 <span className="text-xl font-sans text-[#6B8E7F]/60 font-bold">/ 5</span>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[#6B8E7F] text-[#6B8E7F]" />
              ))}
            </div>
            <p className="text-[#5A5A5A] text-lg">
              Average Rating
            </p>
          </div>

          <div className="text-center bg-white rounded-[28px] py-10 shadow-md border border-[#EFE7DD]">
            <div className="text-5xl font-serif text-[#6B8E7F] mb-3">
              1,500+
            </div>

            <p className="text-[#5A5A5A] text-lg">
              Happy Customers
            </p>
          </div>

          <div className="text-center bg-white rounded-[28px] py-10 shadow-md border border-[#EFE7DD]">
            <div className="text-5xl font-serif text-[#6B8E7F] mb-3">
              98%
            </div>

            <p className="text-[#5A5A5A] text-lg">
              Satisfaction Rate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}