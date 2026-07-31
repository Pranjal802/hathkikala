import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

dotenv.config();

async function addTestEntry() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas successfully.');

  // Find or create test category
  let category = await Category.findOne({ slug: 'test-category' });
  if (!category) {
    category = await Category.create({
      name: 'Atlas Verification Category',
      slug: 'atlas-verification-category',
      description: 'Temporary category to verify Atlas database connection',
      icon: '🚀',
      sortOrder: 99,
    });
    console.log('Created test category:', category.name);
  }

  // Create unique test product
  const testId = Date.now().toString().slice(-4);
  const productName = `ATLAS TEST ITEM #${testId}`;
  
  const product = await Product.create({
    categoryId: category._id,
    name: productName,
    slug: slugify(productName),
    description: 'This is a test product created to verify real-time writing to company MongoDB Atlas database.',
    basePrice: 999,
    discountPrice: 799,
    badge: 'ATLAS VERIFIED',
    emoji: '⭐',
    isBestSeller: true,
    isTrending: true,
    isCustomizable: false,
    productionTimeDays: 1,
    images: [
      {
        url: 'https://res.cloudinary.com/voin9gvd/image/upload/v1/handmade/products/test_item',
        publicId: `test-public-id-${testId}`,
        altText: productName,
        sortOrder: 0,
      },
    ],
    variants: [
      {
        sku: `ATLAS-TEST-${testId}`,
        price: 799,
        stockQty: 50,
        attributes: new Map([['test_attribute', 'Verification Success']]),
        isActive: true,
      },
    ],
  });

  console.log('Successfully inserted test product into Atlas database!');
  console.log('--- Document Details ---');
  console.log('Database Name: hathkikala');
  console.log('Collection Name: products');
  console.log('Product ID (_id):', product._id.toString());
  console.log('Product Name:', product.name);
  console.log('SKU:', `ATLAS-TEST-${testId}`);
  console.log('------------------------');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

addTestEntry().catch((err) => {
  console.error('Error inserting test entry:', err);
  process.exit(1);
});
