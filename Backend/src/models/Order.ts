import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

// Embedded: an order item is a frozen snapshot of what was bought - it should
// NOT change even if the product/price changes later, so name/price are
// duplicated here on purpose (unlike Cart, where a live productId is enough).
export interface IOrderItem {
  productId: Types.ObjectId; // reference - useful for admin to look up the product later
  productName: string; // snapshot, in case product is renamed/deleted later
  variantSku: string;
  variantAttributes: Map<string, string>; // snapshot of size/color at time of purchase
  quantity: number;
  unitPrice: number; // price actually charged, frozen at order time
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  variantSku: { type: String, required: true },
  variantAttributes: { type: Map, of: String, default: {} },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
}, { _id: false });

// Embedded: 1-to-1 with the order, always read together, no reason
// to query payments independently of their order in this app.
export interface IPayment {
  provider: 'razorpay' | 'stripe' | 'paypal';
  providerOrderId?: string; // e.g. Razorpay order_id / Stripe payment_intent id
  providerPaymentId?: string; // set once payment succeeds
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPayment>({
  provider: { type: String, enum: ['razorpay', 'stripe', 'paypal'], required: true },
  providerOrderId: { type: String },
  providerPaymentId: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paidAt: { type: Date },
}, { _id: false });

// Embedded: shipping address is frozen at order time - if the user
// edits/deletes their saved address later, past orders must stay correct.
export interface IShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

export interface IStatusHistoryEntry {
  status: string;
  changedAt: Date;
  note?: string;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

export interface IOrder {
  userId: Types.ObjectId; // reference - one user has many orders (unbounded, never embed into User)

  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  payment: IPayment;

  subtotal: number;
  shippingFee: number;
  totalAmount: number;

  status:
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

  statusHistory: IStatusHistoryEntry[]; // small audit trail, always read with the order

  cancelReason?: string;

  // added by { timestamps: true } below - declared here so TS knows about them
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  items: [OrderItemSchema],
  shippingAddress: { type: ShippingAddressSchema, required: true },
  payment: { type: PaymentSchema, required: true },

  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },

  statusHistory: [StatusHistorySchema],

  cancelReason: { type: String },
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 }); // fast "my orders" list, most recent first
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.providerOrderId': 1 });

export type OrderDocument = HydratedDocument<IOrder>;

export default mongoose.model('Order', orderSchema);