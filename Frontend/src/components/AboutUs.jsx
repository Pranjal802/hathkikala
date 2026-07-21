import {
  Sparkles,
  Heart,
  ShieldCheck,
  HandHeart,
  Star,
  ArrowRight,
} from "lucide-react";
import purseModel from "../assets/purse2_model.png";

const FEATURES = [
  {
    icon: <HandHeart size={24} />,
    title: "Handcrafted With Love",
    description:
      "Every product is carefully handmade with creativity, passion, and detailed craftsmanship.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Premium Quality",
    description:
      "We use high-quality materials, embroidery work, mirrors, fabrics, and accessories.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Unique Designs",
    description:
      "Traditional Indian art blended beautifully with modern fashion aesthetics.",
  },
];

const STATS = [
  {
    number: "500+",
    label: "Happy Customers",
  },
  {
    number: "100%",
    label: "Handmade Products",
  },
  {
    number: "50+",
    label: "Unique Designs",
  },
  {
    number: "5★",
    label: "Customer Reviews",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#F7F3EE] py-24"
    >
      {/* Background Glow */}
      <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-[#6B8E7F]/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#DCCFC0]/30 blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#6B8E7F]/10 text-[#6B8E7F] mb-6">
            <Sparkles size={18} />
            <span className="text-sm font-medium tracking-wide">
              About Us
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#3A3A3A] leading-tight max-w-4xl mx-auto">
            Bringing Handmade Art Into{" "}
            <span className="text-[#6B8E7F]">
              Modern Fashion
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8 mt-8 text-lg">
            Beautiful handcrafted accessories inspired by Indian tradition,
            creativity, and elegance — designed with love for every occasion.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">

          {/* Left Side Image */}
          <div className="relative h-full">

            <div className="h-full min-h-[750px] rounded-[36px] overflow-hidden shadow-2xl">
              <img
                src={purseModel}
                alt="Handmade Creations"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Card */}
            {/* <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-white p-6 rounded-3xl shadow-xl max-w-[260px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6B8E7F]/15 flex items-center justify-center text-[#6B8E7F]">
                  <Star size={22} className="fill-[#6B8E7F]" />
                </div>

                <div>
                  <h4 className="font-semibold text-[#3A3A3A]">
                    Trusted Brand
                  </h4>

                  <p className="text-sm text-gray-500">
                    Handmade with care
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                Unique handcrafted collections made with creativity,
                tradition, and elegance.
              </p>
            </div> */}
          </div>

          {/* Right Side Content */}
          <div className="flex flex-col justify-between h-full">

            <div>

              {/* Heading */}
              <div className="mb-10">
                <h3 className="text-4xl font-serif text-[#3A3A3A] leading-tight mb-6">
                  Crafted With Passion,
                  <br />
                  Styled With Elegance
                </h3>

                <p className="text-gray-600 leading-8 mb-6">
                  Hath Ki Kala (हाथ की कला) is a handcrafted fashion and accessories
                  brand that celebrates creativity, traditional artistry, and
                  timeless beauty through unique handmade products.
                </p>

                <p className="text-gray-600 leading-8">
                  From mirror work blouses and bangles to handmade purses,
                  embroidery collections, and festival accessories — every
                  piece is designed to add elegance and charm to your style.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                {FEATURES.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-5 bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#6B8E7F]/10 flex items-center justify-center text-[#6B8E7F] shrink-0">
                      {item.icon}
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-[#3A3A3A] mb-2">
                        {item.title}
                      </h4>

                      <p className="text-gray-600 leading-7">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5 mt-12">

              <button className="group inline-flex items-center gap-3 bg-[#6B8E7F] hover:bg-[#5D7A6D] text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Explore Collections

                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>

              <button className="border border-[#6B8E7F] text-[#6B8E7F] hover:bg-[#6B8E7F] hover:text-white px-8 py-4 rounded-2xl transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-28">
          {STATS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-4xl font-bold text-[#6B8E7F] mb-3">
                {item.number}
              </h3>

              <p className="text-gray-600 font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="relative overflow-hidden mt-28 bg-[#3A3A3A] rounded-[40px] px-8 py-16 sm:px-16 text-center">

          <div className="absolute top-0 left-0 w-52 h-52 bg-[#6B8E7F]/10 rounded-full blur-3xl"></div>

          <Heart
            size={42}
            className="mx-auto text-[#A8C5B8] fill-[#A8C5B8] mb-8"
          />

          <h3 className="text-3xl sm:text-4xl font-serif text-white leading-relaxed max-w-4xl mx-auto">
            “Every handmade creation carries a story of passion,
            creativity, and tradition.”
          </h3>

          <p className="text-white/60 mt-8 text-lg tracking-wide">
            Hath Ki Kala
          </p>
        </div>
      </div>
    </section>
  );
}