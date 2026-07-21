import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { api } from '../../services/api.js';
import {
  X, LayoutDashboard, Package, ShoppingBag, FolderTree, Tag, Megaphone, Users,
  Plus, Edit2, Trash2, CheckCircle, AlertTriangle, ArrowUpRight, Search, Eye, RefreshCw, Truck,
  Star, MessageSquare, Headset, Check, CornerDownRight
} from 'lucide-react';

export default function AdminPanel() {
  const { adminOpen, setAdminOpen, showNotification, categories, fetchProducts } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats & Data state
  const [stats, setStats] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCoupons, setAdminCoupons] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminSupportTickets, setAdminSupportTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  // Modals inside Admin
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Forms
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    basePrice: '',
    discountPrice: '',
    description: '',
    badge: 'Handmade',
    emoji: '🌸',
    isCustomizable: false,
    productionTimeDays: '3',
    stockQty: '10',
    sku: '',
    imageUrl: '',
  });

  const [siteForm, setSiteForm] = useState({
    announcementText: '',
    heroTitle: '',
    heroSubtitle: '',
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '✨',
  });

  // Load Admin Data
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.getAdminStats();
        if (res.success) setStats(res.data);
      } else if (activeTab === 'products') {
        const res = await api.getAdminProducts();
        if (res.success) setAdminProducts(res.data.products);
      } else if (activeTab === 'orders') {
        const res = await api.getAdminOrders(orderStatusFilter);
        if (res.success) setAdminOrders(res.data.orders);
      } else if (activeTab === 'coupons') {
        const res = await api.getCoupons();
        if (res.success) setAdminCoupons(res.data.coupons);
      } else if (activeTab === 'banners') {
        const res = await api.getSiteSettings();
        if (res.success && res.data.settings) {
          setSiteForm({
            announcementText: res.data.settings.announcementText || '',
            heroTitle: res.data.settings.heroTitle || '',
            heroSubtitle: res.data.settings.heroSubtitle || '',
          });
        }
      } else if (activeTab === 'customers') {
        const res = await api.getCustomers();
        if (res.success) setAdminCustomers(res.data.customers);
      } else if (activeTab === 'categories') {
        const res = await api.getAdminCategories();
        if (res.success) setAdminCategories(res.data.categories);
      } else if (activeTab === 'reviews') {
        const res = await api.getReviews();
        if (res.success) setAdminReviews(res.data.reviews);
      } else if (activeTab === 'support') {
        const res = await api.getSupportTickets();
        if (res.success) setAdminSupportTickets(res.data.tickets);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, orderStatusFilter, showNotification]);

  useEffect(() => {
    loadAdminData();
  }, [activeTab, orderStatusFilter, loadAdminData]);

  // Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        await api.updateProduct(editingProduct.id, {
          name: productForm.name,
          categoryId: productForm.categoryId,
          basePrice: Number(productForm.basePrice),
          description: productForm.description,
          isCustomizable: productForm.isCustomizable,
        });
        showNotification('Product updated successfully!');
      } else {
        // Create product with variant
        await api.createProduct({
          name: productForm.name,
          categoryId: productForm.categoryId || categories[0]?.id,
          basePrice: Number(productForm.basePrice),
          description: productForm.description,
          isCustomizable: productForm.isCustomizable,
          productionTimeDays: Number(productForm.productionTimeDays),
          images: productForm.imageUrl
            ? [
                {
                  url: productForm.imageUrl,
                  publicId: `manual-${Date.now()}`,
                  altText: productForm.name,
                  sortOrder: 0,
                },
              ]
            : [],
          variants: [
            {
              sku: productForm.sku || `${productForm.name.substring(0, 4).toUpperCase()}-${Date.now()}`,
              price: Number(productForm.basePrice),
              stockQty: Number(productForm.stockQty),
              attributes: { type: 'Standard' },
            },
          ],
        });
        showNotification('Product created successfully!');
      }
      setShowAddProduct(false);
      setEditingProduct(null);
      loadAdminData();
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateStock = async (product, variantId, newStock) => {
    try {
      await api.updateVariant(product.id, variantId, { stockQty: Number(newStock) });
      showNotification(`Stock updated for ${product.name}`);
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, trackingNo = '', courier = '') => {
    try {
      await api.updateOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: trackingNo || undefined,
        courierName: courier || undefined,
        note: `Order status changed to ${newStatus}`,
      });
      showNotification(`Order status updated to ${newStatus}`);
      loadAdminData();
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus, trackingNumber: trackingNo, courierName: courier }));
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await api.updateSiteSettings(siteForm);
      showNotification('Homepage banners updated successfully!');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount),
      });
      showNotification('Coupon created!');
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0' });
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.deleteCoupon(id);
      showNotification('Coupon deleted');
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        sortOrder: categories.length + 1,
      });
      showNotification('Category created!');
      setCategoryForm({ name: '', description: '', icon: '✨' });
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateCategory = async (id, data) => {
    try {
      await api.updateCategory(id, data);
      showNotification('Category updated in database!');
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      showNotification('Category deactivated in database');
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateProductDetails = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        basePrice: Number(editingProduct.basePrice),
        description: editingProduct.description,
      });

      if (editingProduct.variants?.[0]?.id) {
        await api.updateVariant(editingProduct.id, editingProduct.variants[0].id, {
          price: Number(editingProduct.discountPrice || editingProduct.basePrice),
          stockQty: Number(editingProduct.stockQty),
        });
      }

      showNotification('Product updated in database!');
      setEditingProduct(null);
      loadAdminData();
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateReviewStatus = async (id, status, adminReply = undefined) => {
    try {
      await api.updateReview(id, { status, adminReply });
      showNotification(`Review status updated to ${status}`);
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateTicketStatus = async (id, status, notes = undefined) => {
    try {
      await api.updateSupportTicket(id, { status, notes });
      showNotification(`Ticket updated to ${status}`);
      loadAdminData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-7xl min-h-[85vh] flex flex-col overflow-hidden border border-rose-100 my-2">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C97C5D] via-[#D8A7B1] to-[#9CAF88] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-white/20 rounded-2xl">✨</span>
            <div>
              <h2 className="text-xl font-extrabold tracking-wide drop-shadow">Hath Ki Kala Admin Studio</h2>
              <p className="text-xs text-white/90 font-medium">Daily Operations & Store Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAdminData}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-white flex items-center gap-1 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => setAdminOpen(false)}
              className="p-2 bg-white/20 hover:bg-rose-600 rounded-full transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-56 bg-rose-50/50 border-r border-rose-100 p-4 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Package className="w-4 h-4" /> Products
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'categories'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <FolderTree className="w-4 h-4" /> Categories
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'coupons'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Tag className="w-4 h-4" /> Coupons
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'banners'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Banners & Text
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'customers'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Users className="w-4 h-4" /> Customers
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'reviews'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Star className="w-4 h-4" /> Reviews & Ratings
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'support'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Headset className="w-4 h-4" /> Support & Inquiries
            </button>
          </div>

          {/* View Container */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Executive Overview</h3>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                    <p className="text-3xl font-extrabold text-[#C97C5D] mt-2">₹{stats?.totalRevenue || 0}</p>
                    <span className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Live Gross Sales
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
                    <p className="text-3xl font-extrabold text-gray-800 mt-2">{stats?.totalOrders || 0}</p>
                    <span className="text-xs text-gray-500 font-semibold mt-2">All-time count</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between bg-amber-50/30">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Fulfillment</span>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats?.pendingOrders || 0}</p>
                    <span className="text-xs text-amber-600 font-semibold mt-2">Requires Action</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-sm flex flex-col justify-between bg-rose-50/30">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Low Stock Alerts</span>
                    <p className="text-3xl font-extrabold text-rose-600 mt-2">{stats?.lowStockCount || 0}</p>
                    <span className="text-xs text-rose-600 font-semibold mt-2">Items ≤ 5 stock</span>
                  </div>
                </div>

                {/* Low Stock Items Summary */}
                {stats?.lowStockItems?.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm">
                    <h4 className="text-lg font-bold text-rose-700 flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Low Stock Inventory Warnings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stats.lowStockItems.map((item) => (
                        <div key={item.id} className="p-3 bg-rose-50 rounded-2xl flex items-center justify-between border border-rose-100">
                          <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                          <span className="px-3 py-1 bg-rose-200 text-rose-800 rounded-full font-bold text-xs">
                            {item.stockQty} left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-gray-800">Product Management</h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '', categoryId: categories[0]?.id || '', basePrice: '', discountPrice: '', description: '',
                        badge: 'Handmade', emoji: '🌸', isCustomizable: false, productionTimeDays: '3', stockQty: '10', sku: '',
                      });
                      setShowAddProduct(true);
                    }}
                    className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold rounded-2xl shadow-md hover:bg-[#b0674a] transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add New Product
                  </button>
                </div>

                {/* Product Table */}
                <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-rose-50/50 border-b border-rose-100 text-gray-600 font-bold">
                        <th className="p-4">Product</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Total Stock</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-rose-50/20 transition">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-xl overflow-hidden shrink-0">
                              {prod.thumbnail ? <img src={prod.thumbnail} alt="" className="w-full h-full object-cover" /> : prod.emoji || '📦'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{prod.name}</p>
                              <span className="text-xs text-gray-400 font-mono">{prod.slug}</span>
                            </div>
                          </td>

                          <td className="p-4 font-bold text-gray-800">₹{prod.basePrice}</td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={prod.totalStock}
                                onBlur={(e) => {
                                  if (prod.variants?.[0]?.id) {
                                    handleUpdateStock(prod, prod.variants[0].id, e.target.value);
                                  }
                                }}
                                className="w-20 px-2 py-1 border border-gray-200 rounded-xl font-bold text-center text-sm"
                              />
                              <span className="text-xs text-gray-500">units</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              prod.totalStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {prod.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>

                          <td className="p-4 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct({
                                  id: prod.id,
                                  name: prod.name,
                                  categoryId: prod.categoryId,
                                  basePrice: prod.basePrice,
                                  discountPrice: prod.discountPrice || prod.basePrice,
                                  description: prod.description || '',
                                  stockQty: prod.totalStock || 10,
                                  variants: prod.variants,
                                });
                              }}
                              className="p-2 text-gray-600 hover:bg-rose-50 rounded-xl transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={async () => {
                                if (confirm(`Deactivate product ${prod.name}?`)) {
                                  await api.deleteProduct(prod.id);
                                  showNotification('Product deactivated');
                                  loadAdminData();
                                }
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-gray-800">Order Fulfillment Stream</h3>

                  <div className="flex gap-2">
                    {['all', 'placed', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          orderStatusFilter === st
                            ? 'bg-[#C97C5D] text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-rose-50'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {adminOrders.map((ord) => (
                    <div key={ord.id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#C97C5D]">#{ord.id.substring(18)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-800 mt-1">{ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone})</p>
                        <p className="text-xs text-gray-500">{ord.shippingAddress?.line1}, {ord.shippingAddress?.city}</p>

                        <div className="flex gap-2 mt-2">
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="text-xs bg-rose-50 text-rose-800 px-2 py-0.5 rounded-lg font-medium">
                              {it.productName} x{it.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total Amount</p>
                          <p className="text-lg font-extrabold text-gray-800">₹{ord.totalAmount}</p>
                        </div>

                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-700"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_production">In Production</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Category Directory</h3>

                <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Crochet Plushies)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Icon Emoji (e.g. 🧸)"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-center"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold rounded-xl shadow hover:bg-[#b0674a]">
                    Add Category
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {adminCategories.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.icon || '🌸'}</span>
                        <div>
                          <h4 className="font-bold text-gray-800">{c.name}</h4>
                          <p className="text-xs text-gray-400 font-mono">{c.slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const newName = prompt('Edit Category Name:', c.name);
                            const newIcon = prompt('Edit Icon Emoji:', c.icon || '🌸');
                            if (newName) {
                              handleUpdateCategory(c.id, { name: newName, icon: newIcon });
                            }
                          }}
                          className="p-1.5 text-gray-600 hover:bg-rose-50 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deactivate category "${c.name}"?`)) {
                              handleDeleteCategory(c.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Promo & Discount Codes</h3>

                <form onSubmit={handleCreateCoupon} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. FESTIVE20)"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    required
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase font-bold"
                  />
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Discount Value"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    required
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold rounded-xl shadow hover:bg-[#b0674a]">
                    Create Coupon
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {adminCoupons.map((c) => (
                    <div key={c._id} className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold font-mono text-[#C97C5D] text-lg">{c.code}</span>
                        <p className="text-xs text-gray-500 font-medium">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Homepage Banners & Announcements</h3>

                <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={siteForm.announcementText}
                      onChange={(e) => setSiteForm({ ...siteForm, announcementText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Hero Main Title</label>
                    <input
                      type="text"
                      value={siteForm.heroTitle}
                      onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Hero Subtitle</label>
                    <textarea
                      value={siteForm.heroSubtitle}
                      onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <button type="submit" className="px-6 py-3 bg-[#C97C5D] text-white font-bold rounded-2xl shadow hover:bg-[#b0674a]">
                    Save Banner Settings
                  </button>
                </form>
              </div>
            )}

            {/* CUSTOMERS TAB */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Customer Directory</h3>

                <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-rose-50/50 border-b border-rose-100 text-gray-600 font-bold">
                        <th className="p-4">Customer Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Orders Placed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-rose-50/20">
                          <td className="p-4 font-bold text-gray-800">{cust.email}</td>
                          <td className="p-4 text-gray-600">{cust.phone}</td>
                          <td className="p-4 font-extrabold text-[#C97C5D]">{cust.orderCount} orders</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Customer Reviews & Moderation</h3>
                  <span className="text-xs font-bold bg-[#9CAF88] text-white px-3 py-1 rounded-full">
                    {adminReviews.length} Total Reviews
                  </span>
                </div>

                <div className="space-y-4">
                  {adminReviews.map((rev) => (
                    <div key={rev._id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-base">{rev.customerName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-medium">Reviewed item: <strong className="text-gray-700">{rev.productName}</strong></p>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              size={13}
                              className={idx < rev.rating ? 'fill-[#D4A017] text-[#D4A017]' : 'text-gray-300'}
                            />
                          ))}
                          <span className="text-xs font-extrabold text-amber-700 ml-1">{rev.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-gray-100 italic">
                        "{rev.comment}"
                      </p>

                      {/* Admin Reply */}
                      {rev.adminReply && (
                        <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-xs space-y-1">
                          <span className="font-bold text-[#C97C5D] flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3" /> Hath Ki Kala Store Response:
                          </span>
                          <p className="text-gray-700 font-medium">{rev.adminReply}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Status: {rev.status}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const reply = prompt('Enter official admin response to customer:', rev.adminReply || '');
                              if (reply !== null) {
                                handleUpdateReviewStatus(rev._id, rev.status, reply);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-200 transition"
                          >
                            💬 Reply as Admin
                          </button>

                          <button
                            onClick={() => handleUpdateReviewStatus(rev._id, rev.status === 'approved' ? 'rejected' : 'approved')}
                            className="px-3 py-1.5 bg-[#C97C5D] text-white text-xs font-bold rounded-xl hover:bg-[#b0674a] transition"
                          >
                            {rev.status === 'approved' ? 'Hide / Unpublish' : 'Approve & Publish'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Customer Support & Custom Inquiries</h3>
                  <span className="text-xs font-bold bg-[#C97C5D] text-white px-3 py-1 rounded-full">
                    {adminSupportTickets.length} Inquiries
                  </span>
                </div>

                <div className="space-y-4">
                  {adminSupportTickets.map((tkt) => (
                    <div key={tkt._id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-[#C97C5D] text-base">{tkt.subject}</span>
                          <p className="text-xs text-gray-500 font-medium">From: <strong className="text-gray-800">{tkt.customerName}</strong> ({tkt.email} · 📞 {tkt.phone})</p>
                        </div>

                        <select
                          value={tkt.status}
                          onChange={(e) => handleUpdateTicketStatus(tkt._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                            tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            tkt.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="new">New Ticket</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed font-medium">
                        {tkt.message}
                      </div>

                      {tkt.notes && (
                        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-xs text-amber-900 font-medium">
                          <strong>Admin Internal Notes:</strong> {tkt.notes}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const notes = prompt('Add internal admin note regarding this inquiry:', tkt.notes || '');
                            if (notes !== null) {
                              handleUpdateTicketStatus(tkt._id, tkt.status, notes);
                            }
                          }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition"
                        >
                          ✏️ Add Internal Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Add New Handmade Product</h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price in INR (₹)"
                value={productForm.basePrice}
                onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              <input
                type="number"
                placeholder="Initial Stock Quantity"
                value={productForm.stockQty}
                onChange={(e) => setProductForm({ ...productForm, stockQty: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              <textarea
                placeholder="Product Description..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              <input
                type="url"
                placeholder="Photo URL"
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C97C5D] text-white rounded-xl font-bold text-sm shadow"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Edit Product Details</h3>
            <form onSubmit={handleUpdateProductDetails} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.basePrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stockQty}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C97C5D] text-white rounded-xl font-bold text-sm shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
