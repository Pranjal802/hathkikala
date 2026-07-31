import type { Request, Response } from 'express';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import { AppError } from '../utils/AppError.js';

// POST /api/upload/single - Admin only single image upload to Cloudinary
export async function uploadSingleImage(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }

  const folder = (req.body.folder as string) || 'handmade/uploads';
  const result = await uploadBufferToCloudinary(req.file.buffer, folder);

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: result,
  });
}

// POST /api/upload/multiple - Admin only multiple images upload to Cloudinary
export async function uploadMultipleImages(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new AppError('No image files provided', 400);
  }

  const folder = (req.body.folder as string) || 'handmade/uploads';
  const uploadedResults = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, folder))
  );

  return res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: uploadedResults,
  });
}

// DELETE /api/upload - Admin only delete image from Cloudinary by publicId
export async function removeImage(req: Request, res: Response) {
  const { publicId } = req.body;
  if (!publicId || typeof publicId !== 'string') {
    throw new AppError('A valid publicId is required', 400);
  }

  await deleteFromCloudinary(publicId);

  return res.status(200).json({
    success: true,
    message: 'Image deletion triggered successfully',
  });
}
