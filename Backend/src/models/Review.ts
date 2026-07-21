import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  customerName: string;
  customerEmail: string;
  productName: string;
  rating: number; // 1-5
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  adminReply?: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    productName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    adminReply: { type: String },
    isVerifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', reviewSchema);
