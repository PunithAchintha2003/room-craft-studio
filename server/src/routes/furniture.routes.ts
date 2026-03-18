import { Router } from 'express';
import { z } from 'zod';
import * as furnitureController from '../controllers/furniture.controller';
import * as furnitureCategoryController from '../controllers/furnitureCategory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadFurnitureAssets, uploadThumbnail } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const categorySlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Category must be kebab-case (e.g. "living-room")');

const createFurnitureSchema = z.object({
  name: z.string().min(3).max(100),
  category: categorySlugSchema,
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

router.get('/categories', furnitureCategoryController.getFurnitureCategories);
router.post(
  '/categories',
  protect,
  restrictTo('admin'),
  validate(z.object({ label: z.string().trim().min(2).max(64) })),
  furnitureCategoryController.createFurnitureCategory
);

router.get('/', furnitureController.getAllFurniture);
router.get('/search', furnitureController.searchFurniture);
router.get('/advanced-search', furnitureController.advancedSearch);
router.get('/featured', furnitureController.getFeaturedFurniture);
router.get(
  '/dashboard-summary',
  protect,
  restrictTo('designer', 'admin'),
  furnitureController.getFurnitureDashboardSummary
);
router.get('/:id', furnitureController.getFurnitureById);
router.get('/:id/related', furnitureController.getRelatedFurniture);

router.post(
  '/',
  protect,
  restrictTo('designer', 'admin'),
  validate(createFurnitureSchema),
  furnitureController.createFurniture
);

router.post(
  '/with-assets',
  protect,
  restrictTo('designer', 'admin'),
  uploadFurnitureAssets,
  furnitureController.createFurnitureWithAssets
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
