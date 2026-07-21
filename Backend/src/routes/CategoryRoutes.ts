import { Router } from 'express';
import {
  listCategories,
  listAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/CategoryController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../dtos/CategoryDtos.js';

const router = Router();

// Public
router.get('/', listCategories);

// Admin only
router.get('/admin/all', protect, restrictTo('admin'), listAllCategoriesAdmin);
router.post('/', protect, restrictTo('admin'), validate(createCategorySchema), createCategory);
router.patch('/:id', protect, restrictTo('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

export default router;
