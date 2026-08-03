import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface ISiteSetting {
  key: string;
  announcementText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  freeShippingThreshold?: number;
  chatWidgetEnabled?: boolean;
  proactiveNudgeEnabled?: boolean;
  proactiveNudgeDelaySeconds?: number;
}

const siteSettingSchema = new Schema<ISiteSetting>({
  key: { type: String, required: true, unique: true, default: 'main' },
  announcementText: { type: String, default: '✨ Special Offer: Free Shipping on Orders Over ₹999! 🎁' },
  heroTitle: { type: String, default: 'Handcrafted With Love & Magic' },
  heroSubtitle: { type: String, default: 'Discover unique handmade crochet toys, mirror work accessories, slime kits & customized gifts.' },
  freeShippingThreshold: { type: Number, default: 999 },
  chatWidgetEnabled: { type: Boolean, default: true },
  proactiveNudgeEnabled: { type: Boolean, default: true },
  proactiveNudgeDelaySeconds: { type: Number, default: 8 },
}, { timestamps: true });

export type SiteSettingDocument = HydratedDocument<ISiteSetting>;
export default mongoose.model<ISiteSetting>('SiteSetting', siteSettingSchema);
