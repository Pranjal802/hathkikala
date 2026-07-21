import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  notes?: string;
  createdAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
