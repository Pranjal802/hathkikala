import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

dotenv.config();

async function placeTestOrder() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas successfully.');

  // 1. Find or create demo customer user
  let user = await User.findOne({ email: 'customer@hathkikala.com' });
  if (!user) {
    user = await User.create({
      name: 'Priya Sharma (Atlas Customer)',
      email: 'customer@hathkikala.com',
      password: 'dummypassword123',
      phone: '+919876543210',
      role: 'customer',
    });
  }

  // 2. Find an active product with stock
  const product = await Product.findOne({ isActive: true });
  if (!product) {
    console.error('No active products found in database.');
    process.exit(1);
  }

  const variant = product.variants.find((v) => v.isActive && v.stockQty > 0) || product.variants[0];
  if (!variant) {
    console.error('No active variants found for product.');
    process.exit(1);
  }

  const orderQuantity = 2;
  const unitPrice = variant.price || product.basePrice;
  const subtotal = unitPrice * orderQuantity;
  const shippingFee = 50;
  const grandTotal = subtotal + shippingFee;

  const plainAttributes = variant.attributes
    ? (variant.attributes instanceof Map
        ? Object.fromEntries(variant.attributes)
        : (typeof variant.attributes === 'object' ? variant.attributes : {}))
    : { type: 'Standard' };

  // 3. Create full realistic Order document
  const order = await Order.create({
    userId: user._id,
    status: 'placed',
    subtotal: subtotal,
    shippingFee: shippingFee,
    totalAmount: grandTotal,
    payment: {
      provider: 'cod',
      status: 'pending',
      amount: grandTotal,
      currency: 'INR',
    },
    shippingAddress: {
      fullName: 'Priya Sharma',
      phone: '+91 98765 43210',
      line1: 'Flat 402, Sunshine Heights, MG Road',
      line2: 'Near Central Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
    items: [
      {
        productId: product._id,
        productName: product.name,
        variantSku: variant.sku,
        variantAttributes: plainAttributes,
        quantity: orderQuantity,
        unitPrice: unitPrice,
      },
    ],
    statusHistory: [
      {
        status: 'placed',
        changedAt: new Date(),
        note: 'Order placed successfully via Customer Checkout Flow',
      },
    ],
  });

  // Clear cart if any exists
  await Cart.deleteMany({ userId: user._id });

  console.log('\n======================================================');
  console.log('SUCCESS! Real Order Entry Created in MongoDB Atlas');
  console.log('======================================================');
  console.log('Database Name    :', 'hathkikala');
  console.log('Collection Name  :', 'orders');
  console.log('Order ID (_id)   :', order._id.toString());
  console.log('Customer Name    :', order.shippingAddress.fullName);
  console.log('Customer Email   :', user.email);
  console.log('Product Ordered  :', product.name);
  console.log('Variant SKU      :', variant.sku);
  console.log('Quantity         :', orderQuantity);
  console.log('Subtotal         :', `₹${order.subtotal}`);
  console.log('Shipping Fee     :', `₹${order.shippingFee}`);
  console.log('Total Amount     :', `₹${order.totalAmount} (COD)`);
  console.log('Order Status     :', order.status.toUpperCase());
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

placeTestOrder().catch((err) => {
  console.error('Error placing order:', err);
  process.exit(1);
});
