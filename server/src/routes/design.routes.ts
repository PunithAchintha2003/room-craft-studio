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

const roomLayoutEnum = z.enum(['rectangle', 'l-shape', 't-shape', 'u-shape', 'angled-bay']);
const cutoutPositionEnum = z.enum([
  'top-left', 'top-right', 'bottom-left', 'bottom-right',
  'top', 'bottom', 'left', 'right',
]);

const wallSideEnum = z.enum(['north', 'south', 'east', 'west']);
const roomOpeningSchema = z.object({
  id: z.string().min(1, 'Opening ID is required'),
  type: z.enum(['door', 'window']),
  wall: wallSideEnum,
  width: z.number().min(0.1).max(10),
  height: z.number().min(0.1).max(10),
  bottom: z.number().min(0).max(10).default(0),
  // Offset from the "left" corner to the START of the opening (meters)
  offset: z.number().min(0),
});

const roomConfigSchema = z.object({
  width: z.number().min(1).max(20),
  length: z.number().min(1).max(20),
  height: z.number().min(2).max(5),
  wallColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#FFFFFF'),
  floorColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#D3D3D3'),
  layout: roomLayoutEnum.optional().default('rectangle'),
  cutoutPosition: cutoutPositionEnum.optional(),
  cutoutWidth: z.number().min(0).optional(),
  cutoutLength: z.number().min(0).optional(),
  wallTexture: z.string().optional(),
  floorTexture: z.string().optional(),
  wallTextureScale: z.number().min(0.1).max(10).optional(),
  floorTextureScale: z.number().min(0.1).max(10).optional(),
  openings: z.array(roomOpeningSchema).optional().default([]),
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
router.get('/preview', designController.getPreviewDesign);
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
