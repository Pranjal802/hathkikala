import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    announcementText: '✨ Special Offer: Free Shipping on Orders Over ₹999! 🎁',
    heroTitle: 'Handcrafted With Love & Magic',
    heroSubtitle: 'Discover unique handmade crochet toys, mirror work accessories, slime kits & customized gifts.',
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [notification, setNotification] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userOrders, setUserOrders] = useState([]);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // 1. Initial Session Check & Site Data Loading
  const initApp = useCallback(async () => {
    try {
      // Check auth session
      const accountRes = await api.getAccount().catch(() => null);
      if (accountRes?.success) {
        setUser(accountRes.data.user);
        if (accountRes.data.cart?.items) {
          setCart(accountRes.data.cart.items);
        }
      }

      // Fetch Categories
      const catRes = await api.getCategories().catch(() => null);
      if (catRes?.success) {
        setCategories(catRes.data.categories);
      }

      // Fetch Site Settings
      const settingsRes = await api.getSiteSettings().catch(() => null);
      if (settingsRes?.success && settingsRes.data.settings) {
        setSiteSettings(settingsRes.data.settings);
      }

      // Fetch Initial Products
      fetchProducts();
    } catch (err) {
      console.error('App init error:', err);
    }
  }, []);

  const fetchProducts = async (params = {}) => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts(params);
      if (res?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Auth Handlers
  const login = async (emailOrPhoneArg, passwordArg) => {
    let emailOrPhone = emailOrPhoneArg;
    let password = passwordArg;

    if (typeof emailOrPhoneArg === 'object' && emailOrPhoneArg !== null) {
      emailOrPhone = emailOrPhoneArg.emailOrPhone || emailOrPhoneArg.email;
      password = emailOrPhoneArg.password;
    }

    const res = await api.login({ emailOrPhone, password });
    if (res.success) {
      setUser(res.data.user);
      showNotification(`Welcome back, ${res.data.user.name || res.data.user.email}! 💕`);
      setLoginOpen(false);

      // Refresh cart & session data
      const acc = await api.getAccount().catch(() => null);
      if (acc?.data?.cart?.items) {
        setCart(acc.data.cart.items);
      }
      return res.data.user;
    }
  };

  const signup = async (userData) => {
    const res = await api.signup(userData);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      showNotification(`Welcome to Hath Ki Kala! 🌸`);
      setLoginOpen(false);
    }
    return res;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.verifyOtp(email, otp);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      showNotification(`Email Verified Successfully! 🌸 Welcome to Hath Ki Kala!`);
      setLoginOpen(false);
    }
    return res;
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
    setCart([]);
    setUserOrders([]);
    setAdminOpen(false);
    showNotification('Logged out successfully');
  };

  // Cart Operations
  const addToCart = async (product, variantSku = null, quantity = 1) => {
    const prodId = product.id || product._id;
    const targetSku = variantSku || product.variants?.[0]?.sku || null;
    const selectedVariant = product.variants?.find((v) => v.sku === targetSku);

    if (user) {
      try {
        const res = await api.addToCart(prodId, targetSku, quantity);
        if (res.success) {
          setCart(res.data.items || []);
          showNotification(`${product.name} added to cart! 🛒`);
        }
      } catch (err) {
        showNotification(err.message || 'Could not add to cart', 'error');
      }
    } else {
      // Local Guest Cart fallback
      setCart((prev) => {
        const itemSku = targetSku || `SKU-${prodId}`;
        const exists = prev.find((i) => i.productId === prodId && i.variantSku === itemSku);
        if (exists) {
          return prev.map((i) =>
            i.productId === prodId && i.variantSku === itemSku
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...prev,
          {
            _id: `guest-${Date.now()}`,
            productId: prodId,
            productName: product.name,
            variantSku: itemSku,
            quantity,
            priceSnapshot: selectedVariant ? selectedVariant.price : (product.discountPrice || product.basePrice),
            thumbnail: product.thumbnail || product.images?.[0]?.url,
          },
        ];
      });
      showNotification(`${product.name} added to cart! 🛒`);
    }
  };

  const updateCartQty = async (itemId, delta) => {
    if (user) {
      try {
        const res = await api.updateCartItem(itemId, delta);
        if (res.success) {
          setCart(res.data.items || []);
        }
      } catch (err) {
        showNotification(err.message, 'error');
      }
    } else {
      setCart((prev) =>
        prev
          .map((i) => {
            if (i._id === itemId) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter(Boolean)
      );
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        const res = await api.removeCartItem(itemId);
        if (res.success) {
          setCart(res.data.items || []);
        }
      } catch (err) {
        showNotification(err.message, 'error');
      }
    } else {
      setCart((prev) => prev.filter((i) => i._id !== itemId));
    }
  };

  // Wishlist Toggle
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        showNotification(`Removed from wishlist 💔`);
        return prev.filter((i) => i.id !== product.id);
      }
      showNotification(`Added to wishlist 💕`);
      return [...prev, product];
    });
  };

  const isWishlisted = (id) => wishlist.some((i) => i.id === id);

  // Fetch Customer Orders
  const fetchMyOrders = async (shouldOpenModal = false) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    try {
      const res = await api.getMyOrders();
      if (res.success) {
        setUserOrders(res.data.orders);
        if (shouldOpenModal) {
          setOrdersOpen(true);
        }
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, i) => sum + (i.priceSnapshot || 0) * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        cart,
        setCart,
        wishlist,
        categories,
        products,
        loadingProducts,
        siteSettings,
        setSiteSettings,

        cartOpen, setCartOpen,
        searchOpen, setSearchOpen,
        loginOpen, setLoginOpen,
        checkoutOpen, setCheckoutOpen,
        ordersOpen, setOrdersOpen,
        adminOpen, setAdminOpen,
        quickViewProduct, setQuickViewProduct,
        notification,

        selectedCategory, setSelectedCategory,
        appliedCoupon, setAppliedCoupon,
        userOrders, setUserOrders, fetchMyOrders,

        showNotification,
        login, signup, verifyOtp, logout,
        addToCart, updateCartQty, removeFromCart,
        toggleWishlist, isWishlisted,
        fetchProducts,

        cartSubtotal, cartCount, discountAmount, cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
