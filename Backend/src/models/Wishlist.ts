import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

export interface IWishlistItem {
  productId: Types.ObjectId;
  addedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

export interface IWishlist {
  userId: Types.ObjectId;
  products: IWishlistItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [WishlistItemSchema]
}, { timestamps: true });

wishlistSchema.index({ userId: 1 });

export type WishlistDocument = HydratedDocument<IWishlist>;
export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
