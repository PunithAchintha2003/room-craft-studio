import { Router } from 'express';
import { z } from 'zod';
import * as designController from '../controllers/design.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const furnitureItemSchema = z.object({
  furnitureId: z.string().min(1, 'Furniture ID is required'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  rotation: z.number().min(0).max(360).default(0),
  scale: z.number().min(0.5).max(2.0).default(1.0),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

const roomConfigSchema = z.object({
  width: z.number().min(1).max(20),
  length: z.number().min(1).max(20),
  height: z.number().min(2).max(5),
  wallColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#FFFFFF'),
  floorColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#D3D3D3'),
});

const createDesignSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  room: roomConfigSchema,
  furniture: z.array(furnitureItemSchema).default([]),
  isPublic: z.boolean().default(false),
});

const updateDesignSchema = createDesignSchema.partial();

router.post('/', protect, validate(createDesignSchema), designController.createDesign);
router.get('/', protect, designController.getUserDesigns);
router.get(
  '/dashboard-summary',
  protect,
  restrictTo('designer', 'admin'),
  designController.getDesignDashboardSummary
);
router.get('/public/:id', designController.getPublicDesign);
router.get('/:id', protect, designController.getDesignById);
router.put('/:id', protect, validate(updateDesignSchema), designController.updateDesign);
router.delete('/:id', protect, designController.deleteDesign);
router.post('/:id/duplicate', protect, designController.duplicateDesign);

export default router;
