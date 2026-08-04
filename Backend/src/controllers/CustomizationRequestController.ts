import type { Request, Response } from 'express';
import CustomizationRequest from '../models/CustomizationRequest.js';
import { AppError } from '../utils/AppError.js';
import { notifyOwnerCustomizationRequest } from '../services/whatsappService.js';

// GET /api/customization-requests/my - Customer get all customization requests
export async function getMyCustomizationRequests(req: Request, res: Response) {
  const userId = req.user!._id;

  const requests = await CustomizationRequest.find({ userId: userId as any })
    .populate('orderId', 'totalAmount status createdAt shippingAddress')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: { requests }
  });
}

// GET /api/customization-requests/order/:orderId - Get customization request for a specific order
export async function getCustomizationByOrder(req: Request, res: Response) {
  const { orderId } = req.params;

  const reqItem = await CustomizationRequest.findOne({ orderId: orderId as any })
    .populate('orderId', 'totalAmount status createdAt');

  return res.status(200).json({
    success: true,
    data: { customizationRequest: reqItem }
  });
}

// POST /api/customization-requests/admin/:id/update - Admin update customization request
export async function updateCustomizationAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { classification, extraChargeAmount, status, adminComment } = req.body;

  const reqItem = await CustomizationRequest.findById(id);
  if (!reqItem) {
    throw new AppError('Customization request not found', 404);
  }

  if (classification) reqItem.classification = classification;
  if (extraChargeAmount !== undefined) reqItem.extraChargeAmount = Number(extraChargeAmount);
  if (status) reqItem.status = status;
  if (adminComment !== undefined) reqItem.adminComment = adminComment;

  await reqItem.save();

  return res.status(200).json({
    success: true,
    message: 'Customization request updated',
    data: { customizationRequest: reqItem }
  });
}

// POST /api/customization-requests - Create a new customization request
export async function createCustomizationRequest(req: Request, res: Response) {
  const { customerName, customerPhone, productName, requirements, orderId, notes } = req.body;

  const created = await CustomizationRequest.create({
    ...(req.user?._id ? { userId: req.user._id as any } : {}),
    ...(orderId ? { orderId } : {}),
    customerName: customerName || req.user?.name || 'Customer',
    customerPhone: customerPhone || req.user?.phone,
    productName: productName || 'Handcrafted Custom Item',
    requirements: requirements || notes || 'Custom size / color specifications',
    status: 'pending',
  } as any);

  // Trigger WhatsApp notification to owner
  notifyOwnerCustomizationRequest({
    customerName: (created as any).customerName || customerName,
    customerPhone: (created as any).customerPhone || customerPhone,
    productName: (created as any).productName || productName,
    requirements: (created as any).requirements || requirements || notes,
  }).catch((err) => console.error('WhatsApp customization notify error:', err));

  return res.status(201).json({
    success: true,
    message: 'Customization request submitted successfully',
    data: { customizationRequest: created },
  });
}
