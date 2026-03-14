import { Router } from 'express';
import authRoutes from './auth.routes';
import designRoutes from './design.routes';
import userRoutes from './user.routes';
import furnitureRoutes from './furniture.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/designs', designRoutes);
router.use('/users', userRoutes);
router.use('/furniture', furnitureRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RoomCraft Studio API is running', timestamp: new Date().toISOString() });
});

export default router;
