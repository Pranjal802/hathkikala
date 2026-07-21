import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import { AppError } from './AppError.js';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// Wraps Cloudinary's upload_stream (callback API) in a Promise so callers
// can just `await` it, and pushes the in-memory multer buffer through it.
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'handmade/products'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result) {
          return reject(new AppError('Image upload failed', 502));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Best-effort cleanup - if this fails we still want the DB-side removal
// (e.g. deleting the product's image entry) to succeed, so callers should
// not let a rejection here block the main operation.
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed for', publicId, err);
  }
}
