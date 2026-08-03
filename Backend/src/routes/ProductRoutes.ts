import { Router } from 'express';
import {
  listProductsByCategory,
  listAllProductsPublic,
  getProductBySlug,
  listProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadProductImages,
  deleteProductImage,
} from '../controllers/ProductController.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { productListQuerySchema, productAdminListQuerySchema, createProductSchema, updateProductSchema, addVariantSchema, updateVariantSchema } from '../dtos/ProductDtos.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { upload } from '../middleware/upload.js';

// Mounted at /api in server.ts, so these become:
//   GET  /api/products
//   GET  /api/categories/:slug/products
//   GET  /api/products/:slug
//   ...admin routes below
const router = Router();

// Public
router.get('/products', listAllProductsPublic);
router.get(
  '/categories/:slug/products',
  validateQuery(productListQuerySchema),
  listProductsByCategory
);
router.get('/products/:slug', getProductBySlug);

// Admin only
router.get('/products/admin/all', protect, restrictTo('admin'), validateQuery(productAdminListQuerySchema), listProductsAdmin);
router.get('/products/:id/admin', protect, restrictTo('admin'), getProductByIdAdmin);
router.post('/products', protect, restrictTo('admin'), validate(createProductSchema), createProduct);
router.patch('/products/:id', protect, restrictTo('admin'), validate(updateProductSchema), updateProduct);
router.delete('/products/:id', protect, restrictTo('admin'), deleteProduct);
router.patch('/products/:id/restore', protect, restrictTo('admin'), restoreProduct);
router.delete('/products/:id/permanent', protect, restrictTo('admin'), permanentDeleteProduct);

router.post('/products/:id/variants', protect, restrictTo('admin'), validate(addVariantSchema), addVariant);
router.patch('/products/:id/variants/:variantId', protect, restrictTo('admin'), validate(updateVariantSchema), updateVariant);
router.delete('/products/:id/variants/:variantId', protect, restrictTo('admin'), deleteVariant);

router.post(
  '/products/:id/images',
  protect,
  restrictTo('admin'),
  upload.array('images', 6),
  uploadProductImages
);
router.delete('/products/:id/images/:imageId', protect, restrictTo('admin'), deleteProductImage);

export default router;
