import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { toUserResponse } from '../utils/toUserResponse.js';
import { toCartResponse } from '../utils/toCartResponse.js';
import { AppError } from '../utils/AppError.js';

// GET /api/account/me
export async function getMyAccount(req: Request, res: Response) {
  if (!req.user) {
    return res.status(200).json({
      success: true,
      data: {
        user: null,
        cart: null,
      },
    });
  }

  const user = req.user;

  const cart = await Cart.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, items: [] } },
    { upsert: true, new: true }
  );

  return res.status(200).json({
    success: true,
    data: {
      user: toUserResponse(user),
      cart: await toCartResponse(cart),
    },
  });
}

// PATCH /api/account/profile - Update User Profile Name & Phone
export async function updateProfile(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { name, phone } = req.body;
  if (name && typeof name === 'string') user.name = name.trim();
  if (phone && typeof phone === 'string') user.phone = phone.trim();

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    data: { user: toUserResponse(user) },
  });
}

// POST /api/account/addresses - Add New Shipping Address
export async function addAddress(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !phone || !line1 || !city || !state || !postalCode) {
    throw new AppError('Required address fields are missing', 400);
  }

  const isFirstAddress = (user.addresses || []).length === 0;
  const setAsDefault = isDefault || isFirstAddress;

  if (setAsDefault && user.addresses) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    label: label || 'Home',
    fullName: fullName.trim(),
    phone: phone.trim(),
    line1: line1.trim(),
    line2: line2 ? line2.trim() : '',
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    country: country || 'India',
    isDefault: Boolean(setAsDefault),
  };

  user.addresses.push(newAddress as any);
  await user.save();

  return res.status(201).json({
    success: true,
    message: 'Address added successfully!',
    data: { user: toUserResponse(user) },
  });
}

// PATCH /api/account/addresses/:addressId - Edit Saved Address
export async function updateAddress(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { addressId } = req.params;
  const targetAddr = (user.addresses as any).id(addressId);
  if (!targetAddr) {
    throw new AppError('Address not found', 404);
  }

  const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;

  if (label !== undefined) targetAddr.label = label;
  if (fullName !== undefined) targetAddr.fullName = fullName.trim();
  if (phone !== undefined) targetAddr.phone = phone.trim();
  if (line1 !== undefined) targetAddr.line1 = line1.trim();
  if (line2 !== undefined) targetAddr.line2 = line2.trim();
  if (city !== undefined) targetAddr.city = city.trim();
  if (state !== undefined) targetAddr.state = state.trim();
  if (postalCode !== undefined) targetAddr.postalCode = postalCode.trim();
  if (country !== undefined) targetAddr.country = country;

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id?.toString() === addressId;
    });
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Address updated successfully!',
    data: { user: toUserResponse(user) },
  });
}

// DELETE /api/account/addresses/:addressId - Delete Saved Address
export async function deleteAddress(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { addressId } = req.params;
  const targetAddr = (user.addresses as any).id(addressId);
  if (!targetAddr) {
    throw new AppError('Address not found', 404);
  }

  const wasDefault = targetAddr.isDefault;
  (user.addresses as any).pull({ _id: addressId });

  if (wasDefault && user.addresses.length > 0 && user.addresses[0]) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Address deleted successfully!',
    data: { user: toUserResponse(user) },
  });
}

// PATCH /api/account/addresses/:addressId/default - Set Default Address
export async function setDefaultAddress(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { addressId } = req.params;
  let found = false;

  user.addresses.forEach((addr) => {
    if (addr._id?.toString() === addressId) {
      addr.isDefault = true;
      found = true;
    } else {
      addr.isDefault = false;
    }
  });

  if (!found) {
    throw new AppError('Address not found', 404);
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Default address updated!',
    data: { user: toUserResponse(user) },
  });
}

// PATCH /api/account/notifications - Update Notification Preferences
export async function updateNotificationPreferences(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { orderUpdatesSms, orderUpdatesWhatsapp, orderUpdatesEmail, promotionalMessages } = req.body;

  if (!user.notificationPreferences) {
    user.notificationPreferences = {
      orderUpdatesSms: true,
      orderUpdatesWhatsapp: true,
      orderUpdatesEmail: true,
      promotionalMessages: false,
    };
  }

  if (orderUpdatesSms !== undefined) user.notificationPreferences.orderUpdatesSms = Boolean(orderUpdatesSms);
  if (orderUpdatesWhatsapp !== undefined) user.notificationPreferences.orderUpdatesWhatsapp = Boolean(orderUpdatesWhatsapp);
  if (orderUpdatesEmail !== undefined) user.notificationPreferences.orderUpdatesEmail = Boolean(orderUpdatesEmail);
  if (promotionalMessages !== undefined) user.notificationPreferences.promotionalMessages = Boolean(promotionalMessages);

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Notification preferences updated!',
    data: { user: toUserResponse(user) }
  });
}

// POST /api/account/change-password - Change Account Password
export async function changePassword(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const dbUser = await User.findById(user._id).select('+password');
  if (!dbUser) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  dbUser.password = await bcrypt.hash(newPassword, 10);
  await dbUser.save();

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully!'
  });
}

// DELETE /api/account/me - Self-serve Account Deletion & Data Privacy Anonymization
export async function deleteAccountSelfServe(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { passwordConfirm } = req.body;
  const dbUser = await User.findById(user._id).select('+password');
  if (!dbUser) {
    throw new AppError('User not found', 404);
  }

  if (dbUser.password && passwordConfirm) {
    const isMatch = await bcrypt.compare(passwordConfirm, dbUser.password);
    if (!isMatch) {
      throw new AppError('Password confirmation is incorrect', 400);
    }
  }

  // Anonymize personal info while retaining order history for legal accounting
  dbUser.name = 'Deleted Account';
  dbUser.email = `deleted_${dbUser._id}@anonymized.local`;
  dbUser.phone = `000000${Math.floor(1000 + Math.random() * 9000)}`;
  dbUser.addresses = [];
  dbUser.isAnonymized = true;
  dbUser.anonymizedAt = new Date();
  dbUser.isActive = false;

  await dbUser.save();

  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' as const : 'lax' as const,
  });

  return res.status(200).json({
    success: true,
    message: 'Account deleted and personal data anonymized successfully.'
  });
}
