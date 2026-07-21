import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Memory storage - we never touch the local filesystem. Each file arrives as
// a Buffer on req.file/req.files, which uploadBufferToCloudinary streams
// straight to Cloudinary.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, WEBP or AVIF images are allowed', 400));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 6, // cap how many images can be attached to one product in one go
  },
});
