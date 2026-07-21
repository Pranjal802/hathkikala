import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface ICoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  usageCount: number;
  expiresAt?: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
}, { timestamps: true });

export type CouponDocument = HydratedDocument<ICoupon>;
export default mongoose.model<ICoupon>('Coupon', couponSchema);
