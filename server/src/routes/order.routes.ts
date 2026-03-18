import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(protect);

// POST /api/orders - Create order from cart
router.post('/', OrderController.createOrder);

// GET /api/orders - Get user's order history
router.get('/', OrderController.getUserOrders);

// GET /api/orders/admin - Get all orders (admin)
router.get('/admin', restrictTo('admin'), OrderController.getAllOrders);

// GET /api/orders/number/:orderNumber - Get order by order number
router.get('/number/:orderNumber', OrderController.getOrderByNumber);

// GET /api/orders/:orderId - Get order by ID
router.get('/:orderId', OrderController.getOrderById);

// PATCH /api/orders/:orderId/cancel - Cancel order
router.patch('/:orderId/cancel', OrderController.cancelOrder);

// PATCH /api/orders/:orderId/status - Update order status (admin only - to be protected)
router.patch('/:orderId/status', OrderController.updateOrderStatus);

export default router;
