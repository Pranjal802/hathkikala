import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

export interface IUnansweredQuestion {
  questionText: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  userId?: Types.ObjectId;
  status: 'new' | 'reviewed' | 'added_to_faq' | 'dismissed';
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const unansweredQuestionSchema = new Schema<IUnansweredQuestion>({
  questionText: { type: String, required: true, trim: true },
  customerName: { type: String, trim: true },
  customerPhone: { type: String, trim: true },
  customerEmail: { type: String, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'added_to_faq', 'dismissed'],
    default: 'new',
  },
  adminNotes: { type: String },
}, { timestamps: true });

unansweredQuestionSchema.index({ status: 1, createdAt: -1 });

export type UnansweredQuestionDocument = HydratedDocument<IUnansweredQuestion>;
export default mongoose.model<IUnansweredQuestion>('UnansweredQuestion', unansweredQuestionSchema);
