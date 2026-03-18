import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadHeroModel } from '../middleware/upload.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.post(
  '/hero-model',
  protect,
  restrictTo('admin', 'designer'),
  uploadHeroModel,
  adminController.uploadHeroModel
);

export default router;

