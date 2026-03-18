import { Router } from 'express';
import authRoutes from './auth.routes';
import designRoutes from './design.routes';
import userRoutes from './user.routes';
import reviewRoutes from './review.routes';
import furnitureRoutes from './furniture.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import wishlistRoutes from './wishlist.routes';
import paymentRoutes from './payment.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/designs', designRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/furniture', furnitureRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payment', paymentRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RoomCraft Studio API is running', timestamp: new Date().toISOString() });
});

export default router;
