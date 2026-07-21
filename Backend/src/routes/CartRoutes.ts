import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem } from '../controllers/CartController.js';
import { protect } from '../middleware/protect.js';
import { validate } from '../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema } from '../dtos/CartDtos.js';

const router = Router();

router.use(protect); // every cart route requires a logged-in user

router.get('/', getCart);
router.post('/items', validate(addCartItemSchema), addItemToCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', removeCartItem);

export default router;
