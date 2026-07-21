import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

// Embedded: a cart item is meaningless without the cart it belongs to,
// and the array is small/bounded (nobody has 10,000 items in a cart).
export interface ICartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId; // reference - product has independent identity, reused across many carts
  variantSku: string; // which specific variant was picked
  quantity: number;
  priceSnapshot: number; // price at the moment it was added - re-validated at checkout
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceSnapshot: { type: Number, required: true },
}, { _id: true });

export interface ICart {
  userId: Types.ObjectId | null; // reference - null for guest carts
  sessionId: string | null; // used for guest carts before login; merge into userId cart on login
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  items: [CartItemSchema],
}, { timestamps: true });

// One active cart per logged-in user; guest carts looked up by sessionId
cartSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);
cartSchema.index({ sessionId: 1 });

export type CartDocument = HydratedDocument<ICart>;

export default mongoose.model('Cart', cartSchema);