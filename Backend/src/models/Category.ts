import mongoose, { Schema, type HydratedDocument } from 'mongoose';

// Its own collection: categories are shared across many products,
// managed independently (admin will add/edit these later).
export interface ICategory {
  name: string; // e.g. "Handmade Purses"
  slug: string; // e.g. "handmade-purses"
  description?: string;
  icon?: string; // emoji or icon URL shown on homepage cards
  sortOrder: number; // controls display order on homepage
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export type CategoryDocument = HydratedDocument<ICategory>;

export default mongoose.model('Category', categorySchema);