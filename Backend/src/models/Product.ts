import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

// Embedded: a variant is meaningless outside its product, and the count
// per product is small/bounded (a handful of size/color combos).
export interface IVariant {
  _id?: Types.ObjectId;
  sku: string; // e.g. "PURSE-GRN-M"
  price: number;
  stockQty: number;
  attributes: Map<string, string>; // e.g. { size: "M", color: "green" }
  isActive: boolean; // lets you retire one variant without touching the product
}

const VariantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stockQty: { type: Number, required: true, min: 0, default: 0 },
  attributes: { type: Map, of: String, default: {} },
  isActive: { type: Boolean, default: true },
}, { _id: true });

// Embedded: images belong only to this product, always fetched together with it.
export interface IImage {
  _id?: Types.ObjectId;
  url: string;
  publicId: string; // Cloudinary public_id, needed to delete the asset later
  altText?: string;
  sortOrder: number;
}

const ImageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  altText: { type: String },
  sortOrder: { type: Number, default: 0 },
}, { _id: true });

export interface IProduct {
  categoryId: Types.ObjectId; // reference - category is shared/managed independently

  name: string;
  slug: string;
  description?: string;

  basePrice: number; // fallback/display price if variants share one price

  isCustomizable: boolean; // true = made-to-order (e.g. stitched blouses)
  productionTimeDays?: number; // e.g. 5-7 days, only relevant if isCustomizable

  variants: IVariant[];
  images: IImage[];

  isActive: boolean; // sold out / discontinued toggle
}

const productSchema = new Schema<IProduct>({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },

  basePrice: { type: Number, required: true, min: 0 },

  isCustomizable: { type: Boolean, default: false },
  productionTimeDays: { type: Number },

  variants: [VariantSchema],
  images: [ImageSchema],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Helpful indexes for the storefront queries you'll actually run
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' }); // basic search

// Enforces SKU uniqueness store-wide (MongoDB treats each array element as
// its own index entry, so this catches duplicates both across different
// products AND within the same product's own variants array).
// unique:true on the VariantSchema field itself would NOT do this - Mongoose
// only turns `unique` into a real index when it's declared on the parent
// schema like this, not inside an embedded sub-schema.
productSchema.index({ 'variants.sku': 1 }, { unique: true });

export type ProductDocument = HydratedDocument<IProduct>;

export default mongoose.model('Product', productSchema);