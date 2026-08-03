import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

export interface IAiTryOnLog {
  userId?: Types.ObjectId;
  guestSessionId?: string;
  productId: Types.ObjectId;
  productName: string;
  userImageUrl: string;
  generatedImageUrl: string;
  posePreference?: 'wearing' | 'holding' | 'studio';
  status: 'success' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const aiTryOnLogSchema = new Schema<IAiTryOnLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  guestSessionId: { type: String },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  userImageUrl: { type: String, required: true },
  generatedImageUrl: { type: String, required: true },
  posePreference: { type: String, enum: ['wearing', 'holding', 'studio'], default: 'wearing' },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
}, { timestamps: true });

aiTryOnLogSchema.index({ productId: 1, createdAt: -1 });

export type AiTryOnLogDocument = HydratedDocument<IAiTryOnLog>;
export default mongoose.model<IAiTryOnLog>('AiTryOnLog', aiTryOnLogSchema);
