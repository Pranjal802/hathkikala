import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import {
  User, MapPin, Phone, Mail, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Home, Briefcase, Tag, X, Save, Sparkles,
  Package, Heart, Star, Bell, Lock, AlertTriangle, RefreshCcw, Download, Printer, Truck, Clock, HeartHandshake, Eye, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, showNotification, setLoginOpen, addToCart } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'orders' | 'customizations' | 'reviews' | 'security'

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Orders State (Paginated 10 per page)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Customizations State
  const [customizations, setCustomizations] = useState([]);
  const [loadingCustomizations, setLoadingCustomizations] = useState(false);

  // Written Reviews State
  const [myReviews, setMyReviews] = useState([]);
  const [unreviewedItems, setUnreviewedItems] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Security & Notifications State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState(user?.notificationPreferences || {
    orderUpdatesSms: true,
    orderUpdatesWhatsapp: true,
    orderUpdatesEmail: true,
    promotionalMessages: false,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
      if (user.notificationPreferences) setNotifications(user.notificationPreferences);
    }
  }, [user]);

  // Fetch Tab Specific Data
  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') fetchOrders(orderPage);
      if (activeTab === 'customizations') fetchCustomizations();
      if (activeTab === 'reviews') fetchReviewsData();
    }
  }, [user, activeTab, orderPage]);

  const fetchOrders = async (page = 1) => {
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders(page, 10);
      if (res.success && res.data?.orders) {
        setOrders(res.data.orders);
        if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomizations = async () => {
    setLoadingCustomizations(true);
    try {
      const res = await api.getMyCustomizationRequests();
      if (res.success && res.data?.requests) {
        setCustomizations(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCustomizations(false);
    }
  };

  const fetchReviewsData = async () => {
    setLoadingReviews(true);
    try {
      const [revRes, unrevRes] = await Promise.all([
        api.getMyReviews().catch(() => null),
        api.getUnreviewedItems().catch(() => null),
      ]);
      if (revRes?.success && revRes.data?.reviews) setMyReviews(revRes.data.reviews);
      if (unrevRes?.success && unrevRes.data?.unreviewedItems) setUnreviewedItems(unrevRes.data.unreviewedItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm">
          👤
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#3E2C23] mb-2">Sign In to View Profile</h2>
        <p className="font-sans text-xs text-[#5C4033]/70 max-w-sm mb-6">
          Please log in to manage your profile, addresses, order history, wishlist, and reviews.
        </p>
        <button
          onClick={() => setLoginOpen(true)}
          className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] text-white px-8 py-3.5 rounded-2xl font-sans font-bold text-xs shadow-md hover:shadow-lg transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Profile Form Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      showNotification('Name and phone number are required', 'error');
      return;
    }
    setUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
    } catch (err) {
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      fullName: user.name || '',
      phone: user.phone || '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: (user.addresses?.length || 0) === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || 'Home',
      fullName: addr.fullName || user.name || '',
      phone: addr.phone || user.phone || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      isDefault: Boolean(addr.isDefault),
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id || editingAddress._id, addressForm);
      } else {
        await addAddress(addressForm);
      }
      setShowAddressModal(false);
    } catch (err) {
      showNotification(err.message || 'Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this saved address?')) {
      try {
        await deleteAddress(addressId);
      } catch (err) {
        showNotification(err.message || 'Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
    } catch (err) {
      showNotification(err.message || 'Failed to set default address', 'error');
    }
  };

  // Order Handlers: Cancel, Re-order, Printable Invoice PDF
  const handleCancelOrder = async (orderId) => {
    try {
      const res = await api.cancelOrder(orderId, cancelReasonInput || 'Cancelled by customer');
      if (res.success) {
        showNotification('Order cancelled successfully');
        setCancellingOrderId(null);
        setCancelReasonInput('');
        fetchOrders(orderPage);
      }
    } catch (err) {
      showNotification(err.message || 'Could not cancel order', 'error');
    }
  };

  const handleReorder = async (orderId) => {
    try {
      const res = await api.reorder(orderId);
      if (res.success) {
        showNotification(res.message || 'Past items added to cart!');
      }
    } catch (err) {
      showNotification(err.message || 'Could not re-order', 'error');
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${order.id || order._id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #3E2C23; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #C97C5D; padding-bottom: 20px; margin-bottom: 25px; }
            .brand { font-size: 26px; font-weight: 800; color: #3E2C23; font-family: serif; }
            .subbrand { font-size: 12px; color: #C97C5D; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; color: #C97C5D; font-size: 28px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .box { background: #FFF8F2; p: 15px; border-radius: 12px; padding: 15px; border: 1px solid #F5E6DA; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 13px; }
            th { background: #F5E6DA; color: #3E2C23; font-weight: bold; }
            .total-box { margin-top: 25px; text-align: right; font-size: 18px; font-weight: bold; color: #C97C5D; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">हाथ की कला (Hath Ki Kala)</div>
              <div class="subbrand">Handcrafted Luxury Store</div>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <div>Order #: ${order.id || order._id}</div>
              <div>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <div class="details-grid">
            <div class="box">
              <strong>Billed & Shipped To:</strong><br/>
              ${order.shippingAddress?.fullName}<br/>
              ${order.shippingAddress?.line1}, ${order.shippingAddress?.line2 || ''}<br/>
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}<br/>
              Phone: ${order.shippingAddress?.phone}
            </div>
            <div class="box">
              <strong>Payment Summary:</strong><br/>
              Status: ${(order.payment?.status || 'PENDING').toUpperCase()}<br/>
              Method: ${(order.payment?.provider || 'COD').toUpperCase()}<br/>
              Fulfillment: ${order.status.toUpperCase()}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr>
                  <td><strong>${item.productName}</strong></td>
                  <td>${item.variantSku}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice}</td>
                  <td>₹${item.unitPrice * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-box">
            Total Amount Paid: ₹${order.totalAmount}
          </div>

          <div class="footer">
            Thank you for supporting traditional Indian artisans and handcrafted arts! ✨ Hath Ki Kala
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Submit Written Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalItem || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.createReview({
        productId: reviewModalItem.productId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success) {
        showNotification(res.message || 'Review submitted!');
        setReviewModalItem(null);
        setReviewComment('');
        fetchReviewsData();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (confirm('Are you sure you want to delete your review?')) {
      try {
        await api.deleteCustomerReview(id);
        showNotification('Review deleted');
        fetchReviewsData();
      } catch (err) {
        showNotification(err.message, 'error');
      }
    }
  };

  // Security & Preferences
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New password and confirmation do not match', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        showNotification('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showNotification(err.message || 'Password update failed', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await api.updateNotificationPreferences(notifications);
      showNotification('Notification preferences saved!');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.deleteAccountSelfServe(deletePasswordConfirm);
      showNotification('Account deactivated and personal info deleted.');
      setShowDeleteModal(false);
      window.location.href = '/';
    } catch (err) {
      showNotification(err.message || 'Account deletion failed', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const savedAddresses = user.addresses || [];

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-10 px-4 text-center mb-8 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md border border-white/20">
              {user.name ? user.name[0].toUpperCase() : '👤'}
            </div>
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-[#D8A7B1]">
                Customer Account Dashboard
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user.name || 'Hath Ki Kala Customer'}</h1>
              <p className="text-xs text-rose-100/80 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/wishlist"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
            >
              <Heart size={14} className="text-rose-300 fill-rose-300" /> Saved Wishlist
            </Link>
            <Link
              to="/track-order"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
            >
              <Truck size={14} className="text-[#9CAF88]" /> Track Order
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-rose-100 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'profile', label: 'Personal Info', icon: User },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'customizations', label: 'Customizations', icon: HeartHandshake },
            { id: 'reviews', label: 'Written Reviews', icon: Star },
            { id: 'security', label: 'Security & Privacy', icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C97C5D] text-white shadow-md'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-[#C97C5D]'
                }`}
              >
                <TabIcon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                  <User className="w-6 h-6 text-[#C97C5D]" /> Personal Information
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage your personal profile details and verification status</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={13} /> Email Verified
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-3 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {updatingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#C97C5D]" /> Saved Delivery Addresses
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Save multiple delivery addresses for seamless 1-click checkout</p>
              </div>

              <button
                onClick={handleOpenAddAddress}
                className="px-5 py-2.5 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-bold rounded-2xl text-xs shadow transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="text-center py-12 bg-rose-50/40 rounded-3xl border border-dashed border-rose-200 space-y-3">
                <MapPin className="w-12 h-12 text-[#C97C5D] mx-auto opacity-50" />
                <h4 className="font-bold text-gray-700 text-base">No saved addresses found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Add your home or office address to enable instant checkout!</p>
                <button
                  onClick={handleOpenAddAddress}
                  className="px-5 py-2.5 bg-[#C97C5D] text-white font-bold rounded-2xl text-xs shadow hover:bg-[#b0674a]"
                >
                  + Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id || addr._id}
                    className={`p-5 rounded-3xl border transition space-y-3 relative ${
                      addr.isDefault ? 'border-[#C97C5D] bg-rose-50/30 shadow-sm' : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-white border border-gray-200 text-gray-800 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                        {addr.label === 'Work' || addr.label === 'Office' ? (
                          <Briefcase className="w-3.5 h-3.5 text-[#C97C5D]" />
                        ) : (
                          <Home className="w-3.5 h-3.5 text-[#C97C5D]" />
                        )}
                        {addr.label || 'Home'}
                      </span>

                      {addr.isDefault ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Default Address
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr.id || addr._id)}
                          className="text-[11px] text-[#C97C5D] font-bold hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-700 pt-1">
                      <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                      <p className="text-gray-500 font-medium">📞 {addr.phone}</p>
                      <p className="leading-relaxed">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      {addr.landmark && <p className="text-gray-500 italic">Landmark: {addr.landmark}</p>}
                      <p className="font-semibold text-gray-800">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-gray-400">{addr.country || 'India'}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id || addr._id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY (PAGINATED, RE-ORDER, CANCEL RULES, PDF INVOICE) */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#C97C5D]" /> Order History & Status
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Track live production, download invoices, re-order, or cancel eligible orders</p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12">
                <RefreshCcw className="w-8 h-8 text-[#C97C5D] animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Fetching your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-rose-50/40 rounded-3xl border border-dashed border-rose-200 space-y-3">
                <Package className="w-12 h-12 text-[#C97C5D] mx-auto opacity-50" />
                <h4 className="font-bold text-gray-700 text-base">No orders found yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Explore our unique handmade products and place your first order!</p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 bg-[#C97C5D] text-white font-bold rounded-2xl text-xs shadow hover:bg-[#b0674a]"
                >
                  Explore Storefront ✨
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const canCancel = ord.status === 'placed' || ord.status === 'confirmed';
                  const isInProduction = ord.status === 'in_production';

                  return (
                    <div
                      key={ord.id || ord._id}
                      className="p-5 rounded-3xl border border-gray-200 hover:border-rose-200 transition bg-white shadow-sm space-y-4"
                    >
                      {/* Order Summary Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gray-800">#{ord.id || ord._id}</span>
                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              ord.status === 'in_production' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                              ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status === 'in_production' ? '🎨 In Production (Handcrafting)' : ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Placed on {new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-[#C97C5D]">₹{ord.totalAmount}</span>
                          <button
                            onClick={() => handlePrintInvoice(ord)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                            title="Download PDF Invoice"
                          >
                            <Download size={13} /> Invoice
                          </button>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">{item.productName}</span>
                              <span className="text-gray-400 font-mono">({item.variantSku} × {item.quantity})</span>
                            </div>
                            <span className="font-semibold text-gray-700">₹{item.unitPrice * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Cancel Rule Banner / Note */}
                      {isInProduction && (
                        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium flex items-center gap-2">
                          <HeartHandshake className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>This item is already being handcrafted for you and can no longer be cancelled.</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleReorder(ord.id || ord._id)}
                          className="px-4 py-2 bg-rose-50 text-[#C97C5D] hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <RefreshCcw size={13} /> Re-Order Items
                        </button>

                        {canCancel ? (
                          <button
                            onClick={() => setCancellingOrderId(ord.id || ord._id)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Cancel Order
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed"
                            title="Cannot cancel orders in production or shipped"
                          >
                            Cancel Disabled
                          </button>
                        )}
                      </div>

                      {/* Cancel Form Expansion */}
                      {cancellingOrderId === (ord.id || ord._id) && (
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-3 mt-2 animate-fadeIn">
                          <label className="block text-xs font-bold text-rose-900">Reason for Cancellation</label>
                          <input
                            type="text"
                            placeholder="e.g. Ordered by mistake, wrong address selected..."
                            value={cancelReasonInput}
                            onChange={(e) => setCancelReasonInput(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-400"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setCancellingOrderId(null)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord.id || ord._id)}
                              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow"
                            >
                              Confirm Cancellation
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-600">
                      Page {orderPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setOrderPage((p) => Math.min(totalPages, p + 1))}
                      disabled={orderPage === totalPages}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMIZATION REQUESTS TRACKER */}
        {activeTab === 'customizations' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                  <HeartHandshake className="w-6 h-6 text-[#C97C5D]" /> Customization Requests Tracker
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Track review status, extra charge approvals, and artisan production notes</p>
              </div>
            </div>

            {loadingCustomizations ? (
              <div className="text-center py-12">
                <RefreshCcw className="w-8 h-8 text-[#C97C5D] animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Fetching customization requests...</p>
              </div>
            ) : customizations.length === 0 ? (
              <div className="text-center py-12 bg-purple-50/40 rounded-3xl border border-dashed border-purple-200 space-y-3">
                <HeartHandshake className="w-12 h-12 text-purple-500 mx-auto opacity-50" />
                <h4 className="font-bold text-gray-700 text-base">No Customization Requests Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">When you request custom colors, initials, or sizes during checkout, your tracker will appear here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customizations.map((reqItem) => (
                  <div key={reqItem._id} className="p-5 rounded-3xl border border-purple-100 bg-purple-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#3E2C23]">{reqItem.productName}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        reqItem.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                        reqItem.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {reqItem.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 bg-white p-3 rounded-2xl border border-purple-100 font-medium">
                      "{reqItem.requestedNotes}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-semibold text-gray-600">
                        Classification: <strong className="uppercase text-[#C97C5D]">{reqItem.classification}</strong>
                        {reqItem.classification === 'minor' ? ' (Complimentary)' : ` (+₹${reqItem.extraChargeAmount})`}
                      </span>
                      {reqItem.adminComment && (
                        <span className="text-purple-900 font-medium italic">Artisan Note: {reqItem.adminComment}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WRITTEN REVIEWS & RATE UNREVIEWED ITEMS */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                  <Star className="w-6 h-6 text-[#C97C5D] fill-[#C97C5D]" /> Reviews Written by You
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage your product reviews or rate recent purchases</p>
              </div>
            </div>

            {/* Unreviewed Prompt Banner */}
            {unreviewedItems.length > 0 && (
              <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 space-y-3">
                <span className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> Pending Purchase Reviews
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unreviewedItems.map((item) => (
                    <div key={item.productId} className="bg-white p-3.5 rounded-2xl border border-amber-100 flex items-center justify-between gap-2 shadow-sm">
                      <div>
                        <p className="font-bold text-xs text-gray-800">{item.productName}</p>
                        <span className="text-[10px] text-emerald-700 font-bold">✓ Verified Purchase</span>
                      </div>
                      <button
                        onClick={() => {
                          setReviewModalItem(item);
                          setReviewRating(5);
                          setReviewComment('');
                        }}
                        className="px-3 py-1.5 bg-[#C97C5D] hover:bg-[#b0674a] text-white rounded-xl text-xs font-bold shadow transition shrink-0"
                      >
                        Rate Purchase ⭐
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Written Reviews List */}
            {loadingReviews ? (
              <div className="text-center py-12">
                <RefreshCcw className="w-8 h-8 text-[#C97C5D] animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Fetching your reviews...</p>
              </div>
            ) : myReviews.length === 0 ? (
              <div className="text-center py-12 bg-rose-50/40 rounded-3xl border border-dashed border-rose-200 space-y-3">
                <Star className="w-12 h-12 text-[#C97C5D] mx-auto opacity-50" />
                <h4 className="font-bold text-gray-700 text-base">No written reviews yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Share your feedback on handcrafted products once your order is delivered!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReviews.map((rev) => (
                  <div key={rev._id} className="p-5 rounded-3xl border border-gray-200 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-800">
                        {rev.productId?.name || 'Handcrafted Product'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < rev.rating ? 'fill-amber-400' : 'text-gray-300'} />
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-1">{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 font-medium leading-relaxed">"{rev.comment}"</p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                      <span className="text-gray-400">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SECURITY, NOTIFICATION PREFERENCES & DATA PRIVACY */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Change Password Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2 border-b border-rose-100 pb-4">
                <Lock className="w-6 h-6 text-[#C97C5D]" /> Account Password & Security
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 bg-[#3E2C23] hover:bg-[#C97C5D] text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2 border-b border-rose-100 pb-4">
                <Bell className="w-6 h-6 text-[#C97C5D]" /> Notification Preferences
              </h3>

              <div className="space-y-4 max-w-xl">
                {[
                  { key: 'orderUpdatesSms', label: 'Order Status SMS Alerts' },
                  { key: 'orderUpdatesWhatsapp', label: 'WhatsApp Live Dispatch Tracking' },
                  { key: 'orderUpdatesEmail', label: 'Email Order Confirmations & Invoices' },
                  { key: 'promotionalMessages', label: 'Festive Offers & New Product Drops' },
                ].map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                    <span className="text-xs font-bold text-gray-800">{pref.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(notifications[pref.key])}
                      onChange={(e) => setNotifications({ ...notifications, [pref.key]: e.target.checked })}
                      className="w-5 h-5 accent-[#C97C5D] rounded cursor-pointer"
                    />
                  </label>
                ))}

                <button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="px-6 py-3 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {savingNotifications ? 'Saving Preferences...' : 'Save Notification Preferences'}
                </button>
              </div>
            </div>

            {/* Account Deletion & Privacy Compliance Card */}
            <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-base">Self-Serve Account Deletion</h4>
                  <p className="text-xs text-rose-700/80">Deactivate your account and permanently anonymize personal data.</p>
                </div>
              </div>

              <p className="text-xs text-rose-900/80 leading-relaxed max-w-2xl">
                In compliance with basic data privacy practices, clicking below will anonymize your personal name, email, phone, and addresses. Your historical order records will be kept anonymously for legal accounting purposes.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition"
              >
                Request Self-Serve Account Deletion
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Write Review Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-100 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-gray-800">Rate & Review Purchase</h3>
              <button onClick={() => setReviewModalItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-1">{reviewModalItem.productName}</p>
                <div className="flex items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star size={24} className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Review Feedback</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the handcrafted quality, finishing, packaging..."
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-[#C97C5D] hover:bg-[#b0674a] text-white rounded-xl text-xs font-bold shadow"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200 animate-fadeIn">
            <h3 className="font-serif text-xl font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Confirm Account Deletion
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This action will anonymize your profile details and deactivate your account permanently. Please type your password to confirm.
            </p>

            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePasswordConfirm}
              onChange={(e) => setDeletePasswordConfirm(e.target.value)}
              className="w-full px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
              >
                {deletingAccount ? 'Anonymizing Account...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-rose-100 my-auto">
            <div className="bg-gradient-to-r from-[#C97C5D] to-[#D8A7B1] px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" /> {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 bg-white/20 hover:bg-rose-600 rounded-full transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address Label (Tag)</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        addressForm.label === lbl ? 'bg-[#C97C5D] text-white border-[#C97C5D]' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Full Name</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Flat / House No. / Building / Street</label>
                <input
                  type="text"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Area / Suburb (Optional)</label>
                <input
                  type="text"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Rose Garden School"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#C97C5D] rounded"
                />
                <span className="text-xs font-bold text-gray-700">Set as default shipping address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-2/3 py-3 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-bold rounded-2xl text-xs shadow transition disabled:opacity-50"
                >
                  {savingAddress ? 'Saving Address...' : editingAddress ? 'Update Address' : 'Save New Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
