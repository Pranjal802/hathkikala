const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://') || envUrl.startsWith('/')) {
    return envUrl;
  }
  return `https://${envUrl}`;
};

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Do not set Content-Type if sending FormData (image upload)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    method: options.method || 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include', // Pass cookie session/token
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || 'An unexpected error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleLogin: (idToken) => request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getAccount: () => request('/account/me'),
  updateProfile: (profileData) =>
    request('/account/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
  addAddress: (addressData) =>
    request('/account/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
  updateAddress: (addressId, addressData) =>
    request(`/account/addresses/${addressId}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    }),
  deleteAddress: (addressId) =>
    request(`/account/addresses/${addressId}`, {
      method: 'DELETE',
    }),
  setDefaultAddress: (addressId) =>
    request(`/account/addresses/${addressId}/default`, {
      method: 'PATCH',
    }),

  // Categories & Products
  getCategories: () => request('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (productId, variantSku, quantity = 1) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, variantSku, quantity }),
    }),
  updateCartItem: (itemId, delta) =>
    request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }),
  removeCartItem: (itemId) =>
    request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  // Customer Orders & Tracking
  createOrder: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getMyOrders: (page = 1, limit = 10) => request(`/orders?page=${page}&limit=${limit}`),
  getOrderById: (id) => request(`/orders/${id}`),
  guestLookupOrder: (orderId, phone) =>
    request('/orders/guest-lookup', {
      method: 'POST',
      body: JSON.stringify({ orderId, phone }),
    }),
  cancelOrder: (id, reason) =>
    request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  reorder: (id) =>
    request(`/orders/${id}/reorder`, {
      method: 'POST',
    }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) =>
    request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  moveWishlistToCart: (productId, variantSku) =>
    request('/wishlist/move-to-cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantSku }),
    }),

  // Customization Requests Tracker
  getMyCustomizationRequests: () => request('/customization-requests/my'),
  getCustomizationByOrder: (orderId) => request(`/customization-requests/order/${orderId}`),

  // Customer Written Reviews
  getMyReviews: () => request('/reviews/my'),
  getUnreviewedItems: () => request('/reviews/unreviewed'),
  createReview: (data) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteCustomerReview: (id) =>
    request(`/reviews/${id}`, {
      method: 'DELETE',
    }),

  // Security & Notifications
  updateNotificationPreferences: (data) =>
    request('/account/notifications', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    request('/account/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAccountSelfServe: (passwordConfirm) =>
    request('/account/me', {
      method: 'DELETE',
      body: JSON.stringify({ passwordConfirm }),
    }),

  // Site Settings & Coupons
  getSiteSettings: () => request('/admin/settings'),
  validateCoupon: (code, orderAmount) =>
    request('/admin/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    }),

  // Admin APIs
  getAdminStats: () => request('/orders/admin/stats'),
  getAdminOrders: (status = 'all') => request(`/orders/admin/all${status !== 'all' ? `?status=${status}` : ''}`),
  updateOrderStatus: (orderId, data) =>
    request(`/orders/admin/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  addOrderStaffNote: (orderId, note) =>
    request(`/orders/admin/${orderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products/admin/all${query ? `?${query}` : ''}`);
  },
  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    }),
  updateVariant: (productId, variantId, variantData) =>
    request(`/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(variantData),
    }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  restoreProduct: (id) => request(`/products/${id}/restore`, { method: 'PATCH' }),
  permanentDeleteProduct: (id) => request(`/products/${id}/permanent`, { method: 'DELETE' }),
  getAdminCategories: () => request('/categories/admin/all'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  updateSiteSettings: (data) => request('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getCoupons: () => request('/admin/coupons'),
  createCoupon: (data) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
  getCustomers: () => request('/admin/customers'),
  getReviews: () => request('/admin/reviews'),
  updateReview: (id, data) => request(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getSupportTickets: () => request('/admin/support'),
  updateSupportTicket: (id, data) => request(`/admin/support/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // Cloudinary & Image Upload APIs
  uploadPaymentProof: (formData) =>
    request('/upload/proof', {
      method: 'POST',
      body: formData,
    }),
  uploadProductImages: (productId, formData) =>
    request(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    }),
  deleteProductImage: (productId, imageId) =>
    request(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    }),
  uploadSingleImage: (formData) =>
    request('/upload/single', {
      method: 'POST',
      body: formData,
    }),
  uploadMultipleImages: (formData) =>
    request('/upload/multiple', {
      method: 'POST',
      body: formData,
    }),
  deleteImage: (publicId) =>
    request('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ publicId }),
    }),
  // Cashfree Payment Gateway APIs
  createCashfreeOrder: (orderId) =>
    request('/payments/cashfree/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  verifyCashfreePayment: (orderId) =>
    request('/payments/cashfree/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  // Chat & Guided FAQ Widget
  getChatQuestions: () => request('/chat/questions'),
  askUnansweredQuestion: (data) =>
    request('/chat/ask-unanswered', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminChatQuestions: () => request('/chat/admin/questions'),
  createAdminChatQuestion: (data) =>
    request('/chat/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminChatQuestion: (id, data) =>
    request(`/chat/admin/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteAdminChatQuestion: (id) =>
    request(`/chat/admin/questions/${id}`, {
      method: 'DELETE',
    }),
  getAdminUnansweredQuestions: () => request('/chat/admin/unanswered'),
  updateAdminUnansweredQuestion: (id, data) =>
    request(`/chat/admin/unanswered/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // AI Virtual Try-On API
  generateVirtualTryOn: (data) =>
    request('/ai/virtual-tryon', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadImage: (formData) =>
    request('/upload/proof', {
      method: 'POST',
      body: formData,
    }),
};


