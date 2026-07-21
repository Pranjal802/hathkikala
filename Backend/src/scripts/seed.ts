import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import SiteSetting from '../models/SiteSetting.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hathkikala';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/hathkikala';

async function seed() {
  console.log('Connecting to MongoDB for seeding...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to Primary DB.');
  } catch (err) {
    console.warn('Atlas DB connection failed, attempting local MongoDB fallback...');
    await mongoose.connect(LOCAL_URI);
    console.log('Connected to Local DB.');
  }

  // 1. Create or update Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  let admin = await User.findOne({ email: 'admin@hathkikala.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Hath Ki Kala Admin',
      email: 'admin@hathkikala.com',
      phone: '9999999999',
      password: adminPasswordHash,
      role: 'admin',
    });
    console.log('Created Admin account: admin@hathkikala.com / admin123');
  } else {
    admin.role = 'admin';
    await admin.save();
    console.log('Updated Admin account role to admin.');
  }

  // 2. Create or update Demo Customer User
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  let customer = await User.findOne({ email: 'customer@hathkikala.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Aanya Sharma',
      email: 'customer@hathkikala.com',
      phone: '9876543210',
      password: customerPasswordHash,
      role: 'customer',
      addresses: [
        {
          fullName: 'Aanya Sharma',
          phone: '9876543210',
          line1: 'Flat 402, Sunshine Apartments',
          line2: 'Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true,
        },
      ],
    });
    console.log('Created Demo Customer account: customer@hathkikala.com / customer123');
  }

  // 3. Site Settings
  let settings = await SiteSetting.findOne({ key: 'main' });
  if (!settings) {
    await SiteSetting.create({
      key: 'main',
      announcementText: '✨ Special Festive Offer: Free Shipping on Orders Over ₹999! 🌸',
      heroTitle: 'Handcrafted With Love & Magic',
      heroSubtitle: 'Discover unique handmade crochet plushies, mirror-work clutches, galaxy slime kits, and bespoke artisanal gifts.',
      freeShippingThreshold: 999,
    });
  }

  // 4. Coupons
  await Coupon.deleteMany({});
  await Coupon.create([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 499, isActive: true },
    { code: 'FESTIVE200', discountType: 'fixed', discountValue: 200, minOrderAmount: 1499, isActive: true },
  ]);
  console.log('Created coupons: WELCOME10, FESTIVE200');

  // 5. Seed Categories
  const categoryData = [
    { name: 'Crochet Toys', slug: 'crochet-toys', description: 'Adorable handmade crochet companions & plushies', icon: '🧸', sortOrder: 1 },
    { name: 'Handmade Purses', slug: 'handmade-purses', description: 'Crafted with love, vibrant threads & elegant style', icon: '👜', sortOrder: 2 },
    { name: 'Mirror Gloves', slug: 'mirror-gloves', description: 'Shimmery mirror-work embroidered traditional beauties', icon: '✨', sortOrder: 3 },
    { name: 'Slime Collection', slug: 'slime-collection', description: 'Squishy satisfying aesthetic slime kits & charms', icon: '🫧', sortOrder: 4 },
    { name: 'DIY Crafts', slug: 'diy-crafts', description: 'Create your own magic with DIY craft materials', icon: '🎨', sortOrder: 5 },
    { name: 'Cute Accessories', slug: 'cute-accessories', description: 'Tiny handcrafted details, keychains & hairpins', icon: '🌸', sortOrder: 6 },
    { name: 'Gift Items', slug: 'gift-items', description: 'Thoughtfully curated handmade hampers & presents', icon: '🎁', sortOrder: 7 },
    { name: 'Home Decor', slug: 'home-decor', description: 'Cozy handcrafted macramé wall hangings & accents', icon: '🏡', sortOrder: 8 },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoryData) {
    let existingCat = await Category.findOne({ slug: cat.slug });
    if (!existingCat) {
      existingCat = await Category.create(cat);
    }
    categoryMap[cat.slug] = existingCat;
  }
  console.log('Seeded categories.');

  // 6. Seed Products
  await Product.deleteMany({});

  const productsToSeed = [
    {
      name: 'Elegant Green Bangles Set',
      slug: 'elegant-green-bangles-set',
      categoryId: categoryMap['cute-accessories']._id,
      basePrice: 599,
      discountPrice: 499,
      badge: 'Best Seller',
      emoji: '💚✨',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: false,
      description: 'Handcrafted premium green bangles embellished with delicate thread work and sparkling beads. Perfect for traditional celebrations.',
      variants: [
        { sku: 'BANGLES-GREEN-24', price: 499, stockQty: 20, attributes: new Map([['size', '2.4 Inches']]), isActive: true },
        { sku: 'BANGLES-GREEN-26', price: 499, stockQty: 15, attributes: new Map([['size', '2.6 Inches']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/green_bangles.jpeg', publicId: 'asset_green_bangles', sortOrder: 0 },
      ],
    },
    {
      name: 'Traditional Festive Red Bangles',
      slug: 'traditional-festive-red-bangles',
      categoryId: categoryMap['cute-accessories']._id,
      basePrice: 699,
      discountPrice: 549,
      badge: 'Trending',
      emoji: '❤️✨',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: false,
      description: 'Vibrant traditional red handmade bangles studded with golden pearls and intricate artisan detailing.',
      variants: [
        { sku: 'BANGLES-RED-24', price: 549, stockQty: 18, attributes: new Map([['size', '2.4 Inches']]), isActive: true },
        { sku: 'BANGLES-RED-26', price: 549, stockQty: 12, attributes: new Map([['size', '2.6 Inches']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/red.jpeg', publicId: 'asset_red_bangles', sortOrder: 0 },
      ],
    },
    {
      name: 'Bridal Handmade Chooda Set',
      slug: 'bridal-handmade-chooda-set',
      categoryId: categoryMap['cute-accessories']._id,
      basePrice: 1299,
      discountPrice: 999,
      badge: 'Premium',
      emoji: '👰✨',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: true,
      productionTimeDays: 3,
      description: 'Grand bridal handmade bangle collection crafted with velvet thread, mirror stones, and ornate traditional work.',
      variants: [
        { sku: 'CHOODA-BRIDAL-FULL', price: 999, stockQty: 8, attributes: new Map([['set', 'Full Royal Set']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/bridal_bangles.jpeg', publicId: 'asset_bridal_bangles', sortOrder: 0 },
      ],
    },
    {
      name: 'Royal Model Bangle Collection',
      slug: 'royal-model-bangle-collection',
      categoryId: categoryMap['cute-accessories']._id,
      basePrice: 1499,
      discountPrice: 1199,
      badge: 'Exclusive',
      emoji: '👑🪞',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: true,
      productionTimeDays: 4,
      description: 'Showstopper royal bangle set designed for weddings and festive functions with hand-set Kundan stones.',
      variants: [
        { sku: 'BANGLES-ROYAL-MODEL', price: 1199, stockQty: 10, attributes: new Map([['finish', 'Gold Kundan']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/bangles_model.png', publicId: 'asset_bangles_model', sortOrder: 0 },
      ],
    },
    {
      name: 'Handcrafted Designer Saree Pin',
      slug: 'handcrafted-designer-saree-pin',
      categoryId: categoryMap['diy-crafts']._id,
      basePrice: 399,
      discountPrice: 299,
      badge: 'Popular',
      emoji: '📌✨',
      isBestSeller: false,
      isTrending: true,
      isCustomizable: false,
      description: 'Intricately designed handmade brooch pin crafted with fine metallic polish and pearls for sarees and dupattas.',
      variants: [
        { sku: 'PIN-SAREE-GOLD', price: 299, stockQty: 25, attributes: new Map([['color', 'Antiqued Gold']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/saree_pin.jpeg', publicId: 'asset_saree_pin', sortOrder: 0 },
      ],
    },
    {
      name: 'Artisanal Mirror Work Blouse',
      slug: 'artisanal-mirror-work-blouse',
      categoryId: categoryMap['home-decor']._id,
      basePrice: 2499,
      discountPrice: 1999,
      badge: 'Limited Edition',
      emoji: '🪞🥻',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: true,
      productionTimeDays: 5,
      description: 'Hand-embroidered ethnic blouse featuring authentic mirror stitch work and vibrant traditional patterns.',
      variants: [
        { sku: 'BLOUSE-MIRROR-FREE', price: 1999, stockQty: 6, attributes: new Map([['size', 'Padded (34-40)']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/blouse.jpeg', publicId: 'asset_blouse', sortOrder: 0 },
      ],
    },
    {
      name: 'Handstitched Velvet Clutch Bag',
      slug: 'handstitched-velvet-clutch-bag',
      categoryId: categoryMap['handmade-purses']._id,
      basePrice: 1799,
      discountPrice: 1499,
      badge: 'Best Seller',
      emoji: '👜✨',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: true,
      productionTimeDays: 2,
      description: 'Plush hand-stitched velvet purse with golden metallic chain strap and handcrafted tassel pullers.',
      variants: [
        { sku: 'PURSE-VELVET-MODEL1', price: 1499, stockQty: 14, attributes: new Map([['color', 'Deep Velvet']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/purse_model.png', publicId: 'asset_purse_model', sortOrder: 0 },
      ],
    },
    {
      name: 'Royal Embroidered Model Purse',
      slug: 'royal-embroidered-model-purse',
      categoryId: categoryMap['handmade-purses']._id,
      basePrice: 1999,
      discountPrice: 1699,
      badge: 'Festive Special',
      emoji: '👑👜',
      isBestSeller: true,
      isTrending: true,
      isCustomizable: true,
      productionTimeDays: 3,
      description: 'Bespoke hand-embroidered luxury purse modeled for grand Indian festivities and ethnic wear.',
      variants: [
        { sku: 'PURSE-ROYAL-MODEL2', price: 1699, stockQty: 9, attributes: new Map([['style', 'Royal Embroidered']]), isActive: true },
      ],
      images: [
        { url: '/src/assets/purse2_model.png', publicId: 'asset_purse2_model', sortOrder: 0 },
      ],
    },
  ];

  await Product.create(productsToSeed);
  console.log(`Seeded ${productsToSeed.length} products successfully!`);

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
