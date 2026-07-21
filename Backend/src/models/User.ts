import mongoose, { Schema, type HydratedDocument, Types } from 'mongoose';

// Embedded sub-shape: an address only makes sense inside a User.
export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // e.g. "Home", "Work"
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

// Plain data shape - use this everywhere except when you actually have
// a fetched Mongoose document in hand.
export interface IUser {
  // username: string;
  name: string;
  email: string;
  phone: string;
  password: string;

  role: 'customer' | 'admin' | 'user';

  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  isPhoneVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  refreshTokens: string[];

  addresses: IAddress[];

  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  // username: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // store bcrypt hash, never plain text

  role: { type: String, enum: ['customer', 'admin', 'user'], default: 'customer' },

  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },

  isPhoneVerified: { type: Boolean, default: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },

  refreshTokens: [{ type: String, select: false }],

  addresses: [AddressSchema],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Never leak sensitive fields when a user document is serialized to JSON
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    return ret;
  },
});

// Type to use whenever you have an actual fetched/saved document
export type UserDocument = HydratedDocument<IUser>;

export default mongoose.model('User', userSchema);