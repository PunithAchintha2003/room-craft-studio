import { Router } from 'express';
import { z } from 'zod';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const updateUserSchema = z.object({
  role: z.enum(['admin', 'designer', 'user']).optional(),
  isActive: z.boolean().optional(),
});

router.use(protect, restrictTo('admin'));

router.get('/stats', userController.getUserStats);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);

export default router;
