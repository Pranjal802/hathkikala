import Navbar from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import CategoriesSection from './components/CategoriesSection.jsx'
import ProductsSection from './components/ProductsSection.jsx'
import GallerySection from './components/GallerySection.jsx'
import TestimonialsSection from './components/TestimonialsSection.jsx'
import NewsletterSection from './components/NewsletterSection.jsx'
import Footer from './components/Footer.jsx'
import AboutUs from './components/AboutUs.jsx'
import WelcomePopup from './components/WelcomePopup.jsx'

function App() {
  return (
    <div className="bg-white">
      <WelcomePopup />
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
      <GallerySection />
      <TestimonialsSection />
      <AboutUs/>
      <NewsletterSection />
      <Footer />
    </div>
  )
}

export default App