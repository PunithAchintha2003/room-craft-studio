import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Admin-only: create notification(s)
router.post('/', restrictTo('admin'), notificationController.create);

// Authenticated user: their own notifications
router.get('/me', notificationController.getMine);
router.get('/me/unread-count', notificationController.getUnreadCount);
router.patch('/me/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.deleteOne);

// Web Push subscription management
router.post('/push-subscription', notificationController.subscribePush);
router.delete('/push-subscription', notificationController.unsubscribePush);

export default router;
