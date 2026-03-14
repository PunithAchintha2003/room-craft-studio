import { Router } from 'express';
import { z } from 'zod';
import * as furnitureController from '../controllers/furniture.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadThumbnail } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const createFurnitureSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.enum(['chair', 'table', 'sofa', 'bed', 'storage']),
  dimensions: z.object({
    width: z.number().min(0.1).max(5),
    length: z.number().min(0.1).max(5),
    height: z.number().min(0.1).max(3),
  }),
  thumbnail: z.string().url(),
  thumbnailAlt: z.string().max(200).optional(),
  model3D: z.object({
    url: z.string().url(),
    format: z.enum(['gltf', 'glb']),
  }),
  defaultColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#8B4513'),
  isColorizable: z.boolean().default(true),
  price: z.number().min(0),
  stock: z.number().min(0).default(0),
});

const updateFurnitureSchema = createFurnitureSchema.partial();

router.get('/', furnitureController.getAllFurniture);
router.get('/search', furnitureController.searchFurniture);
router.get(
  '/dashboard-summary',
  protect,
  restrictTo('designer', 'admin'),
  furnitureController.getFurnitureDashboardSummary
);
router.get('/:id', furnitureController.getFurnitureById);

router.post(
  '/',
  protect,
  restrictTo('designer', 'admin'),
  validate(createFurnitureSchema),
  furnitureController.createFurniture
);
router.put(
  '/:id',
  protect,
  restrictTo('designer', 'admin'),
  validate(updateFurnitureSchema),
  furnitureController.updateFurniture
);
router.patch(
  '/:id/thumbnail',
  protect,
  restrictTo('admin'),
  uploadThumbnail,
  furnitureController.updateFurnitureThumbnail
);
router.delete('/:id', protect, restrictTo('designer', 'admin'), furnitureController.deleteFurniture);

export default router;
