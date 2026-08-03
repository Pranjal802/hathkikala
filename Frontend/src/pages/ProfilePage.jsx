import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { User, MapPin, Phone, Mail, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Home, Briefcase, Tag, X, Save, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, showNotification, setLoginOpen } = useStore();
  const navigate = useNavigate();

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null for new, address obj for edit
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#FFF8F2] min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-[#F5E6DA] rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm">
          👤
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#3E2C23] mb-2">Sign In to View Profile</h2>
        <p className="font-sans text-xs text-[#5C4033]/70 max-w-sm mb-6">
          Please log in to manage your account details, edit delivery addresses, and view your orders.
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

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      fullName: user.name || '',
      phone: user.phone || '',
      line1: '',
      line2: '',
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
    if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      showNotification('Please fill in all required address fields', 'error');
      return;
    }

    setSavingAddress(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
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

  const savedAddresses = user.addresses || [];

  return (
    <div className="bg-[#FFF8F2] min-h-screen pt-24 pb-16">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] text-white py-12 px-4 text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[4px] text-[#D8A7B1] mb-2">
            <Sparkles size={14} /> My Profile & Preferences
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-2">Manage Account & Addresses</h1>
          <p className="font-sans text-xs text-rose-100/80">Logged in as {user.email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Profile Card & Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C97C5D] to-[#D8A7B1] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user.name ? user.name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#3E2C23]">{user.name || 'Hath Ki Kala Customer'}</h3>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#C97C5D]" /> {user.email}
                </p>
              </div>
            </div>

            <span className="self-start sm:self-center px-4 py-1.5 bg-rose-50 border border-rose-200 text-[#C97C5D] rounded-full text-xs font-extrabold uppercase tracking-wider">
              {user.role === 'admin' ? '🛡️ Administrator' : '🌸 Valued Customer'}
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-2xl">
            <h4 className="font-bold text-[#3E2C23] text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#C97C5D]" /> Personal Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C97C5D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Email Address (Cannot be changed)</label>
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
              <Save className="w-4 h-4" /> {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#3E2C23] flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#C97C5D]" /> Saved Delivery Addresses
              </h3>
              <p className="text-xs text-gray-500 mt-1">Manage your home, office, and delivery addresses for quick 1-click checkout</p>
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
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Add your home or office address to enable instant 1-click checkout on your future handmade orders!</p>
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
      </div>

      {/* Add / Edit Address Modal */}
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Area / Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
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
                <span className="text-xs font-bold text-gray-700">Set as my default shipping address</span>
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
