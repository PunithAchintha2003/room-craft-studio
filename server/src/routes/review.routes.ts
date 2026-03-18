import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import * as reviewController from '../controllers/review.controller';

const router = Router();

// Public approved reviews
router.get('/public', reviewController.getPublicReviews);

// Authenticated users create reviews
router.post('/', protect, restrictTo('user', 'designer', 'admin'), reviewController.createReview);

// Admin-only management
router.use(protect, restrictTo('admin'));
router.get('/', reviewController.listReviews);
router.patch('/:id/status', reviewController.updateReviewStatus);

export default router;

