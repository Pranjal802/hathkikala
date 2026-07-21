import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface ISiteSetting {
  key: string;
  announcementText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  freeShippingThreshold?: number;
}

const siteSettingSchema = new Schema<ISiteSetting>({
  key: { type: String, required: true, unique: true, default: 'main' },
  announcementText: { type: String, default: '✨ Special Offer: Free Shipping on Orders Over ₹999! 🎁' },
  heroTitle: { type: String, default: 'Handcrafted With Love & Magic' },
  heroSubtitle: { type: String, default: 'Discover unique handmade crochet toys, mirror work accessories, slime kits & customized gifts.' },
  freeShippingThreshold: { type: Number, default: 999 },
}, { timestamps: true });

export type SiteSettingDocument = HydratedDocument<ISiteSetting>;
export default mongoose.model<ISiteSetting>('SiteSetting', siteSettingSchema);
