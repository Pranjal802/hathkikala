import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

export interface ICustomizationRequest {
  orderId: Types.ObjectId;
  userId?: Types.ObjectId;
  productName: string;
  requestedNotes: string;
  classification: 'minor' | 'major'; // minor = complimentary, major = extra charge
  extraChargeAmount: number;        // 0 if minor
  status: 'requested' | 'under_review' | 'approved' | 'in_production';
  adminComment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const customizationRequestSchema = new Schema<ICustomizationRequest>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  productName: { type: String, required: true },
  requestedNotes: { type: String, required: true },
  classification: { type: String, enum: ['minor', 'major'], default: 'minor' },
  extraChargeAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['requested', 'under_review', 'approved', 'in_production'],
    default: 'requested'
  },
  adminComment: { type: String }
}, { timestamps: true });

customizationRequestSchema.index({ orderId: 1 });
customizationRequestSchema.index({ userId: 1 });

export type CustomizationRequestDocument = HydratedDocument<ICustomizationRequest>;
export default mongoose.model<ICustomizationRequest>('CustomizationRequest', customizationRequestSchema);
