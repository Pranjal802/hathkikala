import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import { AppError } from './AppError.js';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a file buffer directly to Cloudinary using streams.
 * @param buffer - File buffer from multer memory storage
 * @param folder - Destination folder in Cloudinary storage
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'handmade/products'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return reject(
        new AppError('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing in .env', 500)
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result) {
          console.error('Cloudinary Upload Stream Error:', err);
          return reject(new AppError(`Image upload failed: ${err?.message || 'Unknown error'}`, 502));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Deletes an image from Cloudinary by its public ID.
 * Best-effort cleanup so failure won't block main operation.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed for', publicId, err);
  }
}

