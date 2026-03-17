import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

// GET /api/cart - Get user's cart
router.get('/', CartController.getCart);

// GET /api/cart/validate - Validate cart items (stock, prices)
router.get('/validate', CartController.validateCart);

// POST /api/cart/items - Add item to cart
router.post('/items', CartController.addItem);

// PATCH /api/cart/items/:furnitureId - Update cart item
router.patch('/items/:furnitureId', CartController.updateItem);

// DELETE /api/cart/items/:furnitureId - Remove item from cart
router.delete('/items/:furnitureId', CartController.removeItem);

// DELETE /api/cart - Clear entire cart
router.delete('/', CartController.clearCart);

// POST /api/cart/design/:designId - Add all furniture from design to cart
router.post('/design/:designId', CartController.addDesignToCart);

export default router;
