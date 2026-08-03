import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import WelcomePopup from './components/WelcomePopup.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import LoginModal from './components/LoginModal.jsx';
import QuickViewModal from './components/QuickViewModal.jsx';
import SearchModal from './components/SearchModal.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import OrdersModal from './components/OrdersModal.jsx';
import Notification from './components/Notification.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminStudioPage from './pages/AdminStudioPage.jsx';
import GuestOrderTrackingPage from './pages/GuestOrderTrackingPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="bg-[#FFF8F2] min-h-screen flex flex-col justify-between">
      <Notification />

      {!isAdminRoute && (
        <>
          <WelcomePopup />
          <Navbar />
        </>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/track-order" element={<GuestOrderTrackingPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminStudioPage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Customer Modals & Portals */}
      {!isAdminRoute && (
        <>
          <CartDrawer />
          <LoginModal />
          <QuickViewModal />
          <SearchModal />
          <CheckoutModal />
          <OrdersModal />
        </>
      )}
    </div>
  );
}

export default App;