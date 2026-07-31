import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { upload } from '../middleware/upload.js';
import { uploadSingleImage, uploadMultipleImages, removeImage } from '../controllers/UploadController.js';

const router = Router();

// Routes for generic image uploads to Cloudinary (Admin protected)
router.post('/single', protect, restrictTo('admin'), upload.single('image'), uploadSingleImage);
router.post('/multiple', protect, restrictTo('admin'), upload.array('images', 6), uploadMultipleImages);
router.delete('/', protect, restrictTo('admin'), removeImage);

export default router;
