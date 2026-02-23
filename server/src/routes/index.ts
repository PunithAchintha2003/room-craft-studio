import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RoomCraft Studio API is running', timestamp: new Date().toISOString() });
});

export default router;
