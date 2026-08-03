import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

export type ChatCategory =
  | 'Orders & Delivery'
  | 'Customization'
  | 'Pricing & Payment'
  | 'Product & Stock'
  | 'Returns & Support';

export interface IChatQuestion {
  category: ChatCategory;
  question: string;
  answer: string;
  isFeatured: boolean;
  orderPosition: number;
  relatedQuestionIds?: Types.ObjectId[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatQuestionSchema = new Schema<IChatQuestion>({
  category: {
    type: String,
    enum: ['Orders & Delivery', 'Customization', 'Pricing & Payment', 'Product & Stock', 'Returns & Support'],
    required: true,
  },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  isFeatured: { type: Boolean, default: false },
  orderPosition: { type: Number, default: 0 },
  relatedQuestionIds: [{ type: Schema.Types.ObjectId, ref: 'ChatQuestion' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatQuestionSchema.index({ category: 1, isFeatured: -1, orderPosition: 1 });

export type ChatQuestionDocument = HydratedDocument<IChatQuestion>;
export default mongoose.model<IChatQuestion>('ChatQuestion', chatQuestionSchema);
