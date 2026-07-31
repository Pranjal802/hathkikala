import greenBangles from '../assets/green_bangles.jpeg';
import redBangles from '../assets/red.jpeg';
import bridalBangles from '../assets/bridal_bangles.jpeg';
import banglesModel from '../assets/bangles_model.png';
import sareePin from '../assets/saree_pin.jpeg';
import blouse from '../assets/blouse.jpeg';
import purseModel from '../assets/purse_model.png';
import purse2Model from '../assets/purse2_model.png';

const ASSET_MAP = {
  'green_bangles.jpeg': greenBangles,
  'red.jpeg': redBangles,
  'bridal_bangles.jpeg': bridalBangles,
  'bangles_model.png': banglesModel,
  'saree_pin.jpeg': sareePin,
  'blouse.jpeg': blouse,
  'purse_model.png': purseModel,
  'purse2_model.png': purse2Model,
};

export const DEFAULT_PRODUCT_IMAGE = greenBangles;

export function handleImageError(e) {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = greenBangles;
  }
}

export function resolveImageUrl(url) {
  if (!url) return greenBangles;
  if (typeof url !== 'string') return greenBangles;

  // Cloudinary or HTTP(S) external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Base64 data URLs
  if (url.startsWith('data:')) {
    return url;
  }

  // Local assets matching bundled assets
  const filename = url.split('/').pop();
  if (filename && ASSET_MAP[filename]) {
    return ASSET_MAP[filename];
  }

  return url;
}
