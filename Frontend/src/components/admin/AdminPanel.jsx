import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { api } from '../../services/api.js';
import { resolveImageUrl } from '../../utils/resolveImageUrl.js';
import {
  X, LayoutDashboard, Package, ShoppingBag, FolderTree, Tag, Megaphone, Users,
  Plus, Edit2, Trash2, CheckCircle, AlertTriangle, ArrowUpRight, Search, Eye, RefreshCw, Truck,
  Star, MessageSquare, Headset, Check, CornerDownRight, Upload, Image as ImageIcon, Loader2,
  Printer, FileText, Download, Calendar, Filter, Clock, User, MapPin, CreditCard, ShieldCheck,
  Send, FileSpreadsheet, AlertCircle, RefreshCcw
} from 'lucide-react';

export default function AdminPanel() {
  const { adminOpen, setAdminOpen, showNotification, categories, fetchProducts } = useStore();
  const [activeTab, setActiveTab] = useState('orders');

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
  const [uploadingImages, setUploadingImages] = useState(false);

  // Filters & Order Management Studio States
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');
  const [orderSearch, setOrderSearch] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStaffNote, setNewStaffNote] = useState('');
  const [trackingForm, setTrackingForm] = useState({ courierName: '', trackingNumber: '', trackingUrl: '' });
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [productSearch, setProductSearch] = useState('');

  // Modals inside Admin
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [replyingReview, setReplyingReview] = useState(null);
  const [notingTicket, setNotingTicket] = useState(null);

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
    images: [],
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

  // Handlers for Cloudinary image uploads
  const handleFileUploadForNewProduct = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      formData.append('folder', 'handmade/products');

      const res = await api.uploadMultipleImages(formData);
      if (res.success && res.data) {
        const newImgs = res.data.map((item, index) => ({
          url: item.url,
          publicId: item.publicId,
          altText: productForm.name || 'Product Image',
          sortOrder: productForm.images.length + index,
        }));
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...newImgs],
        }));
        showNotification(`${files.length} image(s) uploaded to Cloudinary! ☁️`);
      }
    } catch (err) {
      showNotification(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleUploadImagesForExistingProduct = async (e) => {
    if (!editingProduct) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await api.uploadProductImages(editingProduct.id, formData);
      if (res.success && res.data?.product) {
        setEditingProduct((prev) => ({
          ...prev,
          images: res.data.product.images || [],
        }));
        showNotification(`${files.length} image(s) uploaded to Cloudinary! ☁️`);
        loadAdminData();
        fetchProducts();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleDeleteImageFromExistingProduct = async (imageId) => {
    if (!editingProduct) return;
    try {
      await api.deleteProductImage(editingProduct.id, imageId);
      setEditingProduct((prev) => ({
        ...prev,
        images: (prev.images || []).filter((img) => (img.id || img._id) !== imageId),
      }));
      showNotification('Image deleted from Cloudinary');
      loadAdminData();
      fetchProducts();
    } catch (err) {
      showNotification(err.message || 'Failed to delete image', 'error');
    }
  };

  const generateVariantsFromOptions = (basePrice, baseStock, name, colorsStr, sizesStr, setsStr) => {
    const colors = colorsStr ? colorsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const sets = setsStr ? setsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    const prefix = (name || 'PROD').substring(0, 4).toUpperCase();
    const timestamp = Date.now();

    if (colors.length === 0 && sizes.length === 0 && sets.length === 0) {
      return [
        {
          sku: `${prefix}-${timestamp}`,
          price: Number(basePrice),
          stockQty: Number(baseStock),
          attributes: { type: 'Standard' },
        }
      ];
    }

    const variants = [];
    let index = 1;
    const colorList = colors.length > 0 ? colors : [null];
    const sizeList = sizes.length > 0 ? sizes : [null];
    const setList = sets.length > 0 ? sets : [null];

    for (const c of colorList) {
      for (const s of sizeList) {
        for (const st of setList) {
          const attrs = {};
          if (c) attrs.color = c;
          if (s) attrs.size = s;
          if (st) attrs.set = st;

          const skuParts = [prefix];
          if (c) skuParts.push(c.substring(0, 3).toUpperCase());
          if (s) skuParts.push(s.toUpperCase());
          if (st) skuParts.push(st.replace(/\s+/g, '').toUpperCase());
          skuParts.push(index++);

          variants.push({
            sku: skuParts.join('-'),
            price: Number(basePrice),
            stockQty: Number(baseStock),
            attributes: attrs,
          });
        }
      }
    }

    return variants;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const finalImages = [...productForm.images];
      if (productForm.imageUrl && productForm.imageUrl.trim()) {
        finalImages.push({
          url: productForm.imageUrl.trim(),
          publicId: `manual-${Date.now()}`,
          altText: productForm.name,
          sortOrder: finalImages.length,
        });
      }

      const generatedVariants = generateVariantsFromOptions(
        productForm.basePrice,
        productForm.stockQty,
        productForm.name,
        productForm.colorOptions,
        productForm.sizeOptions,
        productForm.setOptions
      );

      await api.createProduct({
        name: productForm.name,
        categoryId: productForm.categoryId || categories[0]?.id,
        basePrice: Number(productForm.basePrice),
        description: productForm.description,
        isCustomizable: productForm.isCustomizable,
        productionTimeDays: Number(productForm.productionTimeDays),
        images: finalImages,
        variants: generatedVariants,
      });
      showNotification('Product created with color/size/set options! ☁️✨');
      setShowAddProduct(false);
      setProductForm({
        name: '', categoryId: '', basePrice: '', discountPrice: '', description: '',
        badge: 'Handmade', emoji: '🌸', isCustomizable: false, productionTimeDays: '3', stockQty: '10', sku: '',
        colorOptions: '', sizeOptions: '', setOptions: '', imageUrl: '', images: [],
      });
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
      let updatedVariants = undefined;
      if (editingProduct.colorOptions !== undefined || editingProduct.sizeOptions !== undefined || editingProduct.setOptions !== undefined) {
        updatedVariants = generateVariantsFromOptions(
          editingProduct.basePrice,
          editingProduct.stockQty,
          editingProduct.name,
          editingProduct.colorOptions !== undefined ? editingProduct.colorOptions : (editingProduct.variants?.map(v => v.attributes?.color || v.attributes?.get?.('color')).filter(Boolean).join(',') || ''),
          editingProduct.sizeOptions !== undefined ? editingProduct.sizeOptions : (editingProduct.variants?.map(v => v.attributes?.size || v.attributes?.get?.('size')).filter(Boolean).join(',') || ''),
          editingProduct.setOptions !== undefined ? editingProduct.setOptions : (editingProduct.variants?.map(v => v.attributes?.set || v.attributes?.get?.('set')).filter(Boolean).join(',') || '')
        );
      }

      await api.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        basePrice: Number(editingProduct.basePrice),
        description: editingProduct.description,
        ...(updatedVariants ? { variants: updatedVariants } : {}),
        images: (editingProduct.images || []).map((img, i) => ({
          url: img.url,
          publicId: img.publicId || `img-${Date.now()}-${i}`,
          altText: editingProduct.name,
          sortOrder: i,
        })),
      });

      if (!updatedVariants && editingProduct.variants?.[0]?.id) {
        await api.updateVariant(editingProduct.id, editingProduct.variants[0].id, {
          price: Number(editingProduct.discountPrice || editingProduct.basePrice),
          stockQty: Number(editingProduct.stockQty),
        });
      }

      showNotification('Product updated successfully!');
      setEditingProduct(null);
      loadAdminData();
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Order Management Helpers & Handlers
  const handleUpdateOrderStatus = async (id, statusPayload, note = '') => {
    try {
      const payload = typeof statusPayload === 'string' ? { status: statusPayload, note } : { ...statusPayload, note };
      const res = await api.updateOrderStatus(id, payload);
      if (res.success) {
        showNotification(`Order updated successfully!`);
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(res.data.order);
        }
        loadAdminData();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update order', 'error');
    }
  };

  const handleAddStaffNote = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStaffNote.trim()) return;
    try {
      const res = await api.addOrderStaffNote(selectedOrder.id, newStaffNote.trim());
      if (res.success) {
        showNotification('Internal staff note saved!');
        setSelectedOrder(res.data.order);
        setNewStaffNote('');
        loadAdminData();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to save staff note', 'error');
    }
  };

  const printOrderInvoice = (ord) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = ord.items.map((it, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${it.productName}</strong><br/><small style="color:#666;">SKU: ${it.variantSku}</small></td>
        <td style="text-align:center;">${it.quantity}</td>
        <td style="text-align:right;">₹${it.unitPrice}</td>
        <td style="text-align:right;">₹${it.lineTotal}</td>
      </tr>
    `).join('');

    const taxAmount = Math.round(ord.subtotal * 0.05);

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - #${ord.id.slice(-8).toUpperCase()}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #222; max-width: 850px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #C97C5D; padding-bottom: 15px; margin-bottom: 25px; }
          .brand { font-size: 26px; font-weight: bold; color: #C97C5D; letter-spacing: -0.5px; }
          .subbrand { font-size: 12px; color: #666; margin-top: 4px; }
          .inv-title { text-align: right; }
          .inv-title h2 { margin: 0; color: #333; font-size: 22px; }
          .inv-title p { margin: 3px 0 0 0; font-size: 13px; color: #666; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
          .card { background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 8px; font-size: 13px; }
          .card-title { font-weight: bold; text-transform: uppercase; font-size: 11px; color: #C97C5D; margin-bottom: 8px; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #f3f3f3; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #ddd; text-align: left; }
          td { padding: 10px; border: 1px solid #eee; }
          .totals { width: 320px; margin-left: auto; margin-top: 20px; font-size: 13px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #eee; }
          .grand { font-size: 16px; font-weight: bold; color: #C97C5D; border-top: 2px solid #C97C5D; border-bottom: none; padding-top: 10px; margin-top: 5px; }
          .stamp { display: inline-block; margin-top: 20px; padding: 8px 20px; border: 2px solid #10B981; color: #10B981; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🌸 Hath Ki Kala</div>
            <div class="subbrand">Artisanal Handmade Crafts & Goods | GSTIN: 27AAAAA0000A1Z5<br/>Email: support@hathkikala.com</div>
          </div>
          <div class="inv-title">
            <h2>OFFICIAL TAX INVOICE</h2>
            <p>Order ID: <strong>#${ord.id}</strong></p>
            <p>Date: ${new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Billed & Shipped To</div>
            <strong>${ord.shippingAddress?.fullName}</strong><br/>
            Phone: ${ord.shippingAddress?.phone}<br/>
            Address: ${ord.shippingAddress?.line1} ${ord.shippingAddress?.line2 || ''}<br/>
            ${ord.shippingAddress?.city}, ${ord.shippingAddress?.state} - ${ord.shippingAddress?.postalCode}<br/>
            Country: ${ord.shippingAddress?.country || 'India'}
          </div>

          <div class="card">
            <div class="card-title">Payment & Shipping Info</div>
            Payment Method: <strong>${(ord.payment?.provider || 'COD').toUpperCase()}</strong><br/>
            Payment Status: <strong>${(ord.payment?.status || 'PENDING').toUpperCase()}</strong><br/>
            Fulfillment Status: <strong>${(ord.status || 'PLACED').toUpperCase()}</strong><br/>
            ${ord.courierName ? `Courier: <strong>${ord.courierName}</strong><br/>` : ''}
            ${ord.trackingNumber ? `AWB/Tracking: <strong>${ord.trackingNumber}</strong>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Item Description</th>
              <th style="width: 70px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Price (₹)</th>
              <th style="width: 110px; text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>₹${ord.subtotal}</span></div>
          <div class="row"><span>Estimated GST (5%):</span><span>₹${taxAmount}</span></div>
          <div class="row"><span>Shipping Fee:</span><span>₹${ord.shippingFee || 0}</span></div>
          <div class="row grand"><span>Grand Total:</span><span>₹${ord.totalAmount}</span></div>
        </div>

        <div style="text-align: right;">
          <div class="stamp">${ord.payment?.status === 'paid' ? 'PAID IN FULL' : 'PAYMENT DUE ON DELIVERY'}</div>
        </div>

        <div class="footer">
          Thank you for supporting traditional Indian artisans with Hath Ki Kala! 💕<br/>
          This is a computer-generated tax invoice and requires no signature.
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const printPackingSlip = (ord) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = ord.items.map((it) => `
      <tr>
        <td style="text-align:center; padding: 12px; border-bottom: 1px solid #eee;">[ &nbsp; ]</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${it.productName}</strong><br/><small style="color:#666;">SKU: ${it.variantSku}</small></td>
        <td style="text-align:center; padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 16px;">${it.quantity}</td>
      </tr>
    `).join('');

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Packing Slip - #${ord.id.slice(-8).toUpperCase()}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #111; max-width: 750px; margin: 0 auto; }
          .header { border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .box { border: 2px solid #000; padding: 20px; border-radius: 12px; margin-bottom: 20px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #eee; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin:0;">🌸 HATH KI KALA</h2>
            <p style="margin:4px 0 0 0; font-size: 12px; color: #555;">PARCEL PACKING SLIP</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin:0; font-family: monospace;">#${ord.id}</h3>
            <p style="margin:4px 0 0 0; font-size: 12px;">Date: ${new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div class="box">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #555;">SHIP TO:</div>
          <h2 style="margin: 5px 0 0 0;">${ord.shippingAddress?.fullName}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Phone: ${ord.shippingAddress?.phone}</p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">${ord.shippingAddress?.line1} ${ord.shippingAddress?.line2 || ''}</p>
          <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: bold;">${ord.shippingAddress?.city}, ${ord.shippingAddress?.state} - ${ord.shippingAddress?.postalCode}</p>
        </div>

        <h3>Package Items Checklist</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">Checked</th>
              <th>Product Details</th>
              <th style="width: 80px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; color: #555; text-align: center;">
          Packed By: ___________________ &nbsp;&nbsp;&nbsp;&nbsp; Inspection Date: ___________________
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const exportOrdersToCSV = (orders) => {
    if (orders.length === 0) {
      showNotification('No orders to export!', 'error');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Postal Code', 'Payment Method', 'Payment Status', 'Status', 'Subtotal', 'Shipping Fee', 'Total Amount', 'Courier', 'Tracking Number'];
    const rows = orders.map(o => [
      `#${o.id}`,
      new Date(o.createdAt).toLocaleString('en-IN'),
      `"${o.shippingAddress?.fullName || ''}"`,
      `"${o.shippingAddress?.email || o.userId || ''}"`,
      `"${o.shippingAddress?.phone || ''}"`,
      `"${(o.shippingAddress?.line1 || '').replace(/"/g, '""')}"`,
      `"${o.shippingAddress?.city || ''}"`,
      `"${o.shippingAddress?.state || ''}"`,
      `"${o.shippingAddress?.postalCode || ''}"`,
      o.payment?.provider?.toUpperCase() || 'COD',
      o.payment?.status?.toUpperCase() || 'PENDING',
      o.status?.toUpperCase() || 'PLACED',
      o.subtotal,
      o.shippingFee,
      o.totalAmount,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hathkikala_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${orders.length} order(s) to CSV! 📄`);
  };

  // Filtered Orders logic for Order Studio
  const filteredOrders = adminOrders.filter((ord) => {
    if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
    if (paymentStatusFilter !== 'all' && ord.payment?.status !== paymentStatusFilter) return false;
    if (paymentMethodFilter !== 'all' && ord.payment?.provider !== paymentMethodFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchName = ord.shippingAddress?.fullName?.toLowerCase().includes(q);
      const matchPhone = ord.shippingAddress?.phone?.toLowerCase().includes(q);
      const matchCity = ord.shippingAddress?.city?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  }).sort((a, b) => {
    if (orderSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (orderSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (orderSort === 'amount_desc') return b.totalAmount - a.totalAmount;
    if (orderSort === 'amount_asc') return a.totalAmount - b.totalAmount;
    return 0;
  });

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
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'support'
                  ? 'bg-[#C97C5D] text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-100'
              }`}
            >
              <Headset className="w-4 h-4 shrink-0" /> Support & Enquiries
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
                        imageUrl: '', images: [],
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
                              {prod.thumbnail ? <img src={resolveImageUrl(prod.thumbnail)} alt="" className="w-full h-full object-cover" /> : prod.emoji || '📦'}
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
                                  images: prod.images || (prod.thumbnail ? [{ id: 'thumb', url: prod.thumbnail }] : []),
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

            {/* ORDERS TAB - COMPLETE ORDER MANAGEMENT STUDIO */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Header & Export Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Order Management Studio</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Track, fulfill, print invoices, manage tracking, and inspect audit logs</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => exportOrdersToCSV(filteredOrders)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow transition flex items-center gap-2 text-xs"
                      title="Export filtered orders to CSV spreadsheet"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export CSV ({filteredOrders.length})
                    </button>
                  </div>
                </div>

                {/* Search & Filters Controls */}
                <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Search bar */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search by Order ID, customer name, phone, city..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#C97C5D]"
                      />
                      {orderSearch && (
                        <button onClick={() => setOrderSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700"
                      >
                        <option value="all">Payment Status: All</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>

                      <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700"
                      >
                        <option value="all">Payment Method: All</option>
                        <option value="cod">COD</option>
                        <option value="cashfree">Cashfree Online</option>
                        <option value="online">Cards / UPI</option>
                      </select>

                      <select
                        value={orderSort}
                        onChange={(e) => setOrderSort(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700"
                      >
                        <option value="newest">Sort: Newest First</option>
                        <option value="oldest">Sort: Oldest First</option>
                        <option value="amount_desc">Sort: Highest Amount</option>
                        <option value="amount_asc">Sort: Lowest Amount</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
                    {['all', 'placed', 'confirmed', 'in_production', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                          orderStatusFilter === st
                            ? 'bg-[#C97C5D] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center space-y-2">
                      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                      <h4 className="font-bold text-gray-700 text-base">No orders found matching filters</h4>
                      <p className="text-xs text-gray-400">Try clearing your search query or status filter.</p>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div key={ord.id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-gray-100">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-base text-[#C97C5D]">#{ord.id}</span>
                              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                ord.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                                ord.status === 'cancelled' || ord.status === 'refunded' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {ord.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                ord.payment?.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                ord.payment?.status === 'refunded' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {ord.payment?.status || 'PENDING'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Quick Accept / Cancel Buttons */}
                            {ord.status !== 'confirmed' && ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                                title="Accept & Confirm Order"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept Order
                              </button>
                            )}

                            {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel order #${ord.id}?`)) {
                                    handleUpdateOrderStatus(ord.id, 'cancelled');
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                                title="Cancel Order"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            )}

                            {ord.payment?.paymentProof && (
                              <button
                                onClick={() => window.open(resolveImageUrl(ord.payment.paymentProof), '_blank')}
                                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl text-xs transition flex items-center gap-1"
                                title="View Payment Screenshot Proof"
                              >
                                📷 Payment Proof
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setTrackingForm({
                                  courierName: ord.courierName || '',
                                  trackingNumber: ord.trackingNumber || '',
                                  trackingUrl: ord.trackingUrl || '',
                                });
                              }}
                              className="px-3 py-1.5 bg-rose-50 text-[#C97C5D] font-bold rounded-xl text-xs hover:bg-rose-100 transition flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>

                            <button
                              onClick={() => printOrderInvoice(ord)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition flex items-center gap-1.5"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" /> Invoice
                            </button>

                            <button
                              onClick={() => printPackingSlip(ord)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition flex items-center gap-1.5"
                              title="Print Shipping Slip"
                            >
                              <FileText className="w-3.5 h-3.5" /> Slip
                            </button>
                          </div>
                        </div>

                        {/* Customer & Item details preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Customer Info</span>
                            <p className="font-bold text-gray-800">{ord.shippingAddress?.fullName}</p>
                            <p className="text-gray-500">{ord.shippingAddress?.phone}</p>
                            <p className="text-gray-500 truncate">{ord.shippingAddress?.line1}, {ord.shippingAddress?.city}</p>
                          </div>

                          <div>
                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Order Items ({ord.items.length})</span>
                            <div className="flex flex-wrap gap-1">
                              {ord.items.map((it, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">
                                  {it.productName} x{it.quantity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-start md:items-end">
                            <div>
                              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1 text-right">Financials</span>
                              <p className="text-lg font-extrabold text-[#C97C5D]">₹{ord.totalAmount}</p>
                              <span className="text-[10px] text-gray-400 font-medium">Method: {(ord.payment?.provider || 'COD').toUpperCase()}</span>
                            </div>

                            <div className="mt-2">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 focus:outline-none"
                              >
                                <option value="placed">Mark: Placed</option>
                                <option value="confirmed">Mark: Confirmed</option>
                                <option value="in_production">Mark: In Production</option>
                                <option value="processing">Mark: Processing</option>
                                <option value="shipped">Mark: Shipped</option>
                                <option value="delivered">Mark: Delivered</option>
                                <option value="cancelled">Mark: Cancelled</option>
                                <option value="refunded">Mark: Refunded</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                          onClick={() => setEditingCategory({ id: c.id, name: c.name, icon: c.icon || '🌸' })}
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
                            onClick={() => setReplyingReview({ id: rev._id, customerName: rev.customerName, status: rev.status, adminReply: rev.adminReply || '' })}
                            className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-200 transition flex items-center gap-1.5"
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
                  <h3 className="text-2xl font-bold text-gray-800">Customer Support & Custom Enquiries</h3>
                  <span className="text-xs font-bold bg-[#C97C5D] text-white px-3 py-1 rounded-full">
                    {adminSupportTickets.length} Enquiries
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
                          className={`pl-3 pr-8 py-1.5 rounded-xl font-bold text-xs ${
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
                          onClick={() => setNotingTicket({ id: tkt._id, subject: tkt.subject, customerName: tkt.customerName, status: tkt.status, notes: tkt.notes || '' })}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <textarea
                placeholder="Product Description..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />

              {/* Product Variant Options (Colors, Sizes, Sets) */}
              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 space-y-2">
                <label className="block text-xs font-bold text-gray-800">Variant Options (Comma-separated)</label>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Colors (e.g. Red, Blue, Pink, Gold):</label>
                  <input
                    type="text"
                    placeholder="Red, Blue, Emerald Green"
                    value={productForm.colorOptions || ''}
                    onChange={(e) => setProductForm({ ...productForm, colorOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Sizes (e.g. S, M, L, XL, Free Size):</label>
                  <input
                    type="text"
                    placeholder="S, M, L, Free Size"
                    value={productForm.sizeOptions || ''}
                    onChange={(e) => setProductForm({ ...productForm, sizeOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Sets / Bundles (e.g. Single Piece, Set of 2, Set of 4):</label>
                  <input
                    type="text"
                    placeholder="Single Piece, Set of 2, Set of 4, Set of 6"
                    value={productForm.setOptions || ''}
                    onChange={(e) => setProductForm({ ...productForm, setOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Images (Cloudinary)</label>
                <div className="border-2 border-dashed border-rose-200 rounded-2xl p-4 bg-rose-50/40 text-center hover:bg-rose-50/70 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="add-product-images"
                    onChange={handleFileUploadForNewProduct}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <label htmlFor="add-product-images" className="cursor-pointer flex flex-col items-center justify-center gap-1">
                    {uploadingImages ? (
                      <Loader2 className="w-6 h-6 text-[#C97C5D] animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#C97C5D]" />
                    )}
                    <span className="text-xs font-bold text-gray-700">
                      {uploadingImages ? 'Uploading to Cloudinary...' : 'Click to Upload Images to Cloudinary'}
                    </span>
                    <span className="text-[10px] text-gray-400">PNG, JPG, WEBP, AVIF up to 5MB</span>
                  </label>
                </div>

                {/* Uploaded Images Preview Grid */}
                {(productForm.images?.length || 0) > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {(productForm.images || []).map((img, idx) => (
                      <div key={idx} className="relative group w-full h-16 rounded-xl overflow-hidden border border-rose-200 bg-gray-100">
                        <img src={resolveImageUrl(img.url)} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-medium mb-1">Or paste photo URL directly (optional):</label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                />
              </div>

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
                  disabled={uploadingImages}
                  className="px-5 py-2 bg-[#C97C5D] text-white rounded-xl font-bold text-sm shadow hover:bg-[#b0674a] transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800">Edit Product & Images</h3>
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

              <div className="grid grid-cols-2 gap-3">
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

              {/* Product Options in Edit Product */}
              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 space-y-2">
                <label className="block text-xs font-bold text-gray-800">Product Options (Colors, Sizes, Sets)</label>
                
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Colors (e.g. Red, Blue, Pink):</label>
                  <input
                    type="text"
                    placeholder="Red, Blue, Pink"
                    value={editingProduct.colorOptions !== undefined ? editingProduct.colorOptions : (
                      editingProduct.variants?.map(v => v.attributes?.color || v.attributes?.get?.('color')).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') || ''
                    )}
                    onChange={(e) => setEditingProduct({ ...editingProduct, colorOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Sizes (e.g. S, M, L, XL, Free Size):</label>
                  <input
                    type="text"
                    placeholder="S, M, L, Free Size"
                    value={editingProduct.sizeOptions !== undefined ? editingProduct.sizeOptions : (
                      editingProduct.variants?.map(v => v.attributes?.size || v.attributes?.get?.('size')).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') || ''
                    )}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizeOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Sets / Bundles (e.g. Single Piece, Set of 2, Set of 4):</label>
                  <input
                    type="text"
                    placeholder="Single Piece, Set of 2, Set of 4"
                    value={editingProduct.setOptions !== undefined ? editingProduct.setOptions : (
                      editingProduct.variants?.map(v => v.attributes?.set || v.attributes?.get?.('set')).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') || ''
                    )}
                    onChange={(e) => setEditingProduct({ ...editingProduct, setOptions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Cloudinary Images Manager */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Cloudinary Product Images</label>

                {(editingProduct.images?.length || 0) > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(editingProduct.images || []).map((img) => (
                      <div key={img.id || img._id || img.url} className="relative group w-full h-16 rounded-xl overflow-hidden border border-rose-200 bg-gray-100">
                        <img src={resolveImageUrl(img.url)} alt="Product" className="w-full h-full object-cover" />
                        {(img.id || img._id) && (img.id !== 'thumb') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteImageFromExistingProduct(img.id || img._id)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                            title="Delete from Cloudinary"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-2 italic">No images attached to this product.</p>
                )}

                {/* Upload More Images */}
                <div className="border-2 border-dashed border-rose-200 rounded-2xl p-3 bg-rose-50/40 text-center hover:bg-rose-50/70 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="edit-product-images"
                    onChange={handleUploadImagesForExistingProduct}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <label htmlFor="edit-product-images" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-[#C97C5D]">
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Add More Images to Cloudinary
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="px-5 py-2 bg-[#C97C5D] text-white rounded-xl font-bold text-sm shadow hover:bg-[#b0674a] transition disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* FULL ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-rose-100 my-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-gray-800 font-mono">#{selectedOrder.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'cancelled' || selectedOrder.status === 'refunded' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Order Placed: {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => printOrderInvoice(selectedOrder)}
                  className="px-3.5 py-2 bg-rose-50 text-[#C97C5D] font-bold rounded-2xl text-xs hover:bg-rose-100 transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  onClick={() => printPackingSlip(selectedOrder)}
                  className="px-3.5 py-2 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs hover:bg-gray-200 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Shipping Label
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C97C5D]" />
                <div>
                  <span className="text-xs font-bold text-gray-700">Update Order Fulfillment Status</span>
                  <p className="text-[10px] text-gray-500">Updating status automatically logs an entry in the order audit trail</p>
                </div>
              </div>

              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-800 shadow-sm"
              >
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* 3-Column Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Customer & Address */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#C97C5D] font-bold uppercase tracking-wider text-[11px]">
                  <User className="w-4 h-4" /> Customer & Shipping
                </div>
                <p className="font-extrabold text-sm text-gray-800">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-gray-600 font-medium">📞 {selectedOrder.shippingAddress?.phone}</p>
                <p className="text-gray-600">
                  📍 {selectedOrder.shippingAddress?.line1} {selectedOrder.shippingAddress?.line2 || ''}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                </p>
              </div>

              {/* Card 2: Payment Details */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#C97C5D] font-bold uppercase tracking-wider text-[11px]">
                  <CreditCard className="w-4 h-4" /> Payment Details
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold text-gray-800 uppercase">{selectedOrder.payment?.provider || 'COD'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-bold uppercase ${selectedOrder.payment?.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedOrder.payment?.status || 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-extrabold text-gray-800 text-sm">₹{selectedOrder.totalAmount}</span>
                </div>
                {selectedOrder.payment?.providerOrderId && (
                  <p className="text-[10px] text-gray-400 font-mono truncate">Ref: {selectedOrder.payment.providerOrderId}</p>
                )}
              </div>

              {/* Card 3: Shipping & Tracking */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#C97C5D] font-bold uppercase tracking-wider text-[11px]">
                  <Truck className="w-4 h-4" /> Shipping & Tracking
                </div>
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Courier (e.g. Blue Dart, Delhivery)"
                    value={trackingForm.courierName}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Tracking AWB Number"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, {
                        courierName: trackingForm.courierName,
                        trackingNumber: trackingForm.trackingNumber,
                        trackingUrl: trackingForm.trackingUrl,
                      });
                    }}
                    className="w-full py-1.5 bg-[#C97C5D] text-white font-bold rounded-xl shadow hover:bg-[#b0674a] transition text-xs"
                  >
                    Save & Mark Shipped
                  </button>
                </div>
              </div>
            </div>

            {/* Itemized Order Products Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C97C5D]" /> Itemized Products
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                      <th className="p-3">Product Description</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-800">{it.productName}</td>
                        <td className="p-3 font-mono text-gray-500">{it.variantSku}</td>
                        <td className="p-3 text-center font-bold">{it.quantity}</td>
                        <td className="p-3 text-right text-gray-700">₹{it.unitPrice}</td>
                        <td className="p-3 text-right font-extrabold text-gray-800">₹{it.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals & Staff Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Internal Staff Notes */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C97C5D]" /> Internal Staff Notes
                </h4>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-36 overflow-y-auto space-y-2">
                  {(selectedOrder.staffNotes || []).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No staff notes added yet.</p>
                  ) : (
                    selectedOrder.staffNotes.map((noteObj, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-100 text-xs">
                        <p className="text-gray-800 font-medium">{noteObj.note}</p>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                          <span>{noteObj.author}</span>
                          <span>{new Date(noteObj.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddStaffNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an internal staff note..."
                    value={newStaffNote}
                    onChange={(e) => setNewStaffNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#C97C5D] text-white rounded-xl font-bold text-xs shadow hover:bg-[#b0674a]">
                    Save Note
                  </button>
                </form>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-right mb-2">Order Breakdown</h4>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated GST (5% Included):</span>
                  <span className="font-semibold">₹{Math.round(selectedOrder.subtotal * 0.05)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold">₹{selectedOrder.shippingFee || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#C97C5D] pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Status History & Audit Log */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C97C5D]" /> Audit Trail & History Log
              </h4>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2 text-xs max-h-36 overflow-y-auto">
                {selectedOrder.statusHistory?.map((h, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-gray-200/50 pb-1.5 last:border-none">
                    <div>
                      <span className="font-bold uppercase text-gray-700 mr-2">[{h.status}]</span>
                      <span className="text-gray-600">{h.note || 'Status updated'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(h.changedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-rose-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#C97C5D]" /> Edit Category
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-rose-50 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingCategory.name) {
                  handleUpdateCategory(editingCategory.id, {
                    name: editingCategory.name,
                    icon: editingCategory.icon,
                  });
                  setEditingCategory(null);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Icon Emoji
                </label>
                <input
                  type="text"
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C97C5D] text-white hover:bg-[#b0674a] shadow transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLY AS ADMIN MODAL */}
      {replyingReview && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-rose-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">Reply to Customer Review</h3>
                <p className="text-xs text-gray-500 font-medium">Customer: <strong>{replyingReview.customerName}</strong></p>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-rose-50 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateReviewStatus(replyingReview.id, replyingReview.status, replyingReview.adminReply);
                setReplyingReview(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Store Response
                </label>
                <textarea
                  rows={4}
                  value={replyingReview.adminReply}
                  onChange={(e) => setReplyingReview({ ...replyingReview, adminReply: e.target.value })}
                  placeholder="Thank you for your feedback! We are thrilled you love your handmade item..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C97C5D] text-white hover:bg-[#b0674a] shadow transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD INTERNAL NOTES MODAL */}
      {notingTicket && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-rose-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">Support Ticket Notes</h3>
                <p className="text-xs text-gray-500 font-medium">Subject: <strong className="text-[#C97C5D]">{notingTicket.subject}</strong> ({notingTicket.customerName})</p>
              </div>
              <button
                onClick={() => setNotingTicket(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-rose-50 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTicketStatus(notingTicket.id, notingTicket.status, notingTicket.notes);
                setNotingTicket(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Internal Staff Notes (Only visible to admin)
                </label>
                <textarea
                  rows={4}
                  value={notingTicket.notes}
                  onChange={(e) => setNotingTicket({ ...notingTicket, notes: e.target.value })}
                  placeholder="e.g. Contacted artisan on WhatsApp for custom yarn availability..."
                  className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#C97C5D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNotingTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C97C5D] text-white hover:bg-[#b0674a] shadow transition"
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

