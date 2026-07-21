import type { Request, Response } from 'express';
import SiteSetting from '../models/SiteSetting.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

// GET /api/admin/settings - Public & Admin
export async function getSiteSettings(req: Request, res: Response) {
  let settings = await SiteSetting.findOne({ key: 'main' });
  if (!settings) {
    settings = await SiteSetting.create({ key: 'main' });
  }
  return res.status(200).json({ success: true, data: { settings } });
}

// PATCH /api/admin/settings - Admin only
export async function updateSiteSettings(req: Request, res: Response) {
  const { announcementText, heroTitle, heroSubtitle, freeShippingThreshold } = req.body;

  let settings = await SiteSetting.findOne({ key: 'main' });
  if (!settings) {
    settings = new SiteSetting({ key: 'main' });
  }

  if (announcementText !== undefined) settings.announcementText = announcementText;
  if (heroTitle !== undefined) settings.heroTitle = heroTitle;
  if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
  if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;

  await settings.save();
  return res.status(200).json({ success: true, message: 'Site settings updated', data: { settings } });
}

// GET /api/admin/coupons - Admin list coupons
export async function listCoupons(req: Request, res: Response) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: { coupons } });
}

// POST /api/admin/coupons - Admin create coupon
export async function createCoupon(req: Request, res: Response) {
  const { code, discountType, discountValue, minOrderAmount } = req.body;
  if (!code || !discountValue) {
    throw new AppError('Code and discountValue are required', 400);
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new AppError('Coupon code already exists', 409);
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType: discountType || 'percentage',
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    isActive: true,
  });

  return res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
}

// DELETE /api/admin/coupons/:id - Admin delete coupon
export async function deleteCoupon(req: Request, res: Response) {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);
  return res.status(200).json({ success: true, message: 'Coupon deleted' });
}

// POST /api/coupons/apply - Validate coupon code for checkout
export async function validateCoupon(req: Request, res: Response) {
  const { code, orderAmount } = req.body;
  if (!code) {
    throw new AppError('Coupon code is required', 400);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    throw new AppError('Invalid or expired promo code', 404);
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  return res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    },
  });
}

// GET /api/admin/customers - List registered users with order counts
export async function listCustomers(req: Request, res: Response) {
  const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });

  const customersWithStats = await Promise.all(
    users.map(async (u) => {
      const orderCount = await Order.countDocuments({ userId: u._id });
      return {
        id: u._id.toString(),
        email: u.email,
        phone: u.phone,
        role: u.role,
        orderCount,
        createdAt: (u as any).createdAt,
      };
    })
  );

  return res.status(200).json({ success: true, data: { customers: customersWithStats } });
}

// GET /api/admin/reviews - List & moderate reviews
import Review from '../models/Review.js';
export async function listReviews(req: Request, res: Response) {
  let reviews = await Review.find().sort({ createdAt: -1 });
  if (reviews.length === 0) {
    // Seed initial demo reviews
    reviews = await Review.create([
      {
        customerName: 'Aanya Sharma',
        customerEmail: 'aanya@example.com',
        productName: 'Strawberry Crochet Bear',
        rating: 5,
        comment: 'So soft and beautifully made! The stitching details are incredible. My sister loved it!',
        status: 'approved',
        isVerifiedPurchase: true,
      },
      {
        customerName: 'Rohan Mehta',
        customerEmail: 'rohan@example.com',
        productName: 'Boho Mirror Clutch',
        rating: 5,
        comment: 'Hand-stitched perfection! Wore it to a wedding function and got so many compliments.',
        status: 'approved',
        isVerifiedPurchase: true,
      },
      {
        customerName: 'Priya Patel',
        customerEmail: 'priya@example.com',
        productName: 'Galaxy Butter Slime Kit',
        rating: 4,
        comment: 'Super satisfying texture and lovely lavender scent. Stretches really well!',
        status: 'approved',
        isVerifiedPurchase: true,
      },
    ]);
  }
  return res.status(200).json({ success: true, data: { reviews } });
}

// PATCH /api/admin/reviews/:id - Moderate review / Add admin reply
export async function updateReview(req: Request, res: Response) {
  const { id } = req.params;
  const { status, adminReply } = req.body;
  const review = await Review.findByIdAndUpdate(
    id,
    { ...(status && { status }), ...(adminReply !== undefined && { adminReply }) },
    { new: true }
  );
  return res.status(200).json({ success: true, message: 'Review updated', data: { review } });
}

// GET /api/admin/support - List customer support tickets / inquiries
import SupportTicket from '../models/SupportTicket.js';
export async function listSupportTickets(req: Request, res: Response) {
  let tickets = await SupportTicket.find().sort({ createdAt: -1 });
  if (tickets.length === 0) {
    // Seed initial support tickets
    tickets = await SupportTicket.create([
      {
        customerName: 'Simran Kaur',
        email: 'simran@example.com',
        phone: '9811223344',
        subject: 'Custom Color Order Request for Mirror Gloves',
        message: 'Hi Hath Ki Kala team! Can I request custom gold embroidery on the Royal Blue mirror gloves for an upcoming wedding?',
        status: 'new',
      },
      {
        customerName: 'Kabir Verma',
        email: 'kabir@example.com',
        phone: '9711556677',
        subject: 'Bulk Gift Hamper Inquiry for Diwali',
        message: 'Looking to order 15 Deluxe Artisanal Gift Hampers for corporate gifting. What are the lead times?',
        status: 'in_progress',
        notes: 'Called customer on phone. Preparing quotation for 15 units.',
      },
    ]);
  }
  return res.status(200).json({ success: true, data: { tickets } });
}

// PATCH /api/admin/support/:id - Update ticket status & notes
export async function updateSupportTicket(req: Request, res: Response) {
  const { id } = req.params;
  const { status, notes } = req.body;
  const ticket = await SupportTicket.findByIdAndUpdate(
    id,
    { ...(status && { status }), ...(notes !== undefined && { notes }) },
    { new: true }
  );
  return res.status(200).json({ success: true, message: 'Support ticket updated', data: { ticket } });
}

// POST /api/support - Public endpoint for visitors to submit support inquiries
export async function createSupportTicket(req: Request, res: Response) {
  const { customerName, email, phone, subject, message } = req.body;
  if (!customerName || !email || !message) {
    throw new AppError('Name, email, and message are required', 400);
  }

  const ticket = await SupportTicket.create({
    customerName,
    email,
    phone: phone || 'N/A',
    subject: subject || 'General Inquiry',
    message,
    status: 'new',
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! Your message has been sent to our team.',
    data: { ticket },
  });
}
