import HeroSection from '../components/HeroSection.jsx';
import CategoriesSection from '../components/CategoriesSection.jsx';
import ProductsSection from '../components/ProductsSection.jsx';
import GallerySection from '../components/GallerySection.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import AboutUs from '../components/AboutUs.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
      <GallerySection />
      <TestimonialsSection />
      <AboutUs />
      <NewsletterSection />
    </main>
  );
}
