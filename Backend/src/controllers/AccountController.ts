import type { Request, Response } from 'express';
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
