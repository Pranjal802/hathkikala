import { Router } from 'express';
import { getWishlist, toggleWishlist, moveToCart } from '../controllers/WishlistController.js';
import { protect } from '../middleware/protect.js';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.post('/move-to-cart', moveToCart);

export default router;
