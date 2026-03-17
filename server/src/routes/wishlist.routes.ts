import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All wishlist routes require authentication
router.use(protect);

// GET /api/wishlist - Get user's wishlist
router.get('/', WishlistController.getWishlist);

// GET /api/wishlist/check/:furnitureId - Check if item is in wishlist
router.get('/check/:furnitureId', WishlistController.checkItem);

// POST /api/wishlist/items/:furnitureId - Add item to wishlist
router.post('/items/:furnitureId', WishlistController.addItem);

// DELETE /api/wishlist/items/:furnitureId - Remove item from wishlist
router.delete('/items/:furnitureId', WishlistController.removeItem);

export default router;
