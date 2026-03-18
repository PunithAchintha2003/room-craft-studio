import { Request, Response, NextFunction } from 'express';
import * as furnitureService from '../services/furniture.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.util';
import { FurnitureCategory } from '../types/design.types';
import { getPublicBaseUrl, saveUploadToPublicFolder, validateImageUpload, validateModelUpload } from '../utils/localUpload';

export const createFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const furniture = await furnitureService.createFurniture(req.body);
    sendCreated(res, { furniture }, 'Furniture item created successfully');
  } catch (error) {
    next(error);
  }
};

export const createFurnitureWithAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const thumbnailFile = files?.thumbnail?.[0];
    const modelFile = files?.model?.[0];

    if (!thumbnailFile?.buffer) {
      sendError(res, 'Thumbnail image is required.', 400);
      return;
    }
    if (!modelFile?.buffer) {
      sendError(res, '3D model file (.glb/.gltf) is required.', 400);
      return;
    }

    try {
      validateImageUpload(thumbnailFile);
      validateModelUpload(modelFile);
    } catch (e) {
      sendError(res, e instanceof Error ? e.message : 'Invalid upload.', 400);
      return;
    }

    const thumbnailSaved = await saveUploadToPublicFolder({
      kind: 'thumbnails',
      buffer: thumbnailFile.buffer,
      originalname: thumbnailFile.originalname,
    });
    const modelSaved = await saveUploadToPublicFolder({
      kind: 'models',
      buffer: modelFile.buffer,
      originalname: modelFile.originalname,
    });

    const baseUrl = getPublicBaseUrl(req);
    const thumbnailUrl = `${baseUrl}${thumbnailSaved.relativeUrlPath}`;
    const modelUrl = `${baseUrl}${modelSaved.relativeUrlPath}`;
    const modelFormat = modelSaved.ext === '.gltf' ? 'gltf' : 'glb';

    // Multer gives strings; coerce fields to expected types.
    const numWidth = Number(req.body.width);
    const numLength = Number(req.body.length);
    const numHeight = Number(req.body.height);
    const numPrice = Number(req.body.price ?? 0);
    const numStock = Number(req.body.stock ?? 0);

    const category = req.body.category as FurnitureCategory;
    const isColorizable = String(req.body.isColorizable ?? 'true') === 'true';
    const defaultColor = (req.body.defaultColor as string) || '#8B4513';
    const thumbnailAlt = (req.body.thumbnailAlt as string) || undefined;

    const furniture = await furnitureService.createFurniture({
      name: String(req.body.name ?? '').trim(),
      category,
      dimensions: { width: numWidth, length: numLength, height: numHeight },
      thumbnail: thumbnailUrl,
      thumbnailAlt,
      model3D: { url: modelUrl, format: modelFormat },
      defaultColor: String(defaultColor).trim(),
      isColorizable,
      price: numPrice,
      stock: numStock,
    });

    sendCreated(res, { furniture }, 'Furniture item created successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.query.category as FurnitureCategory | undefined;
    const furniture = await furnitureService.getAllFurniture(category);
    sendSuccess(res, { furniture }, 'Furniture catalog retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFurnitureById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const furniture = await furnitureService.getFurnitureById(id);
    sendSuccess(res, { furniture }, 'Furniture item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const furniture = await furnitureService.updateFurniture(id, req.body);
    sendSuccess(res, { furniture }, 'Furniture item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await furnitureService.deleteFurniture(id);
    sendSuccess(res, null, 'Furniture item deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const searchFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const searchTerm = req.query.search as string | undefined;
    const category = req.query.category as FurnitureCategory | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    const furniture = await furnitureService.searchFurniture(
      searchTerm || '',
      category,
      minPrice,
      maxPrice
    );
    sendSuccess(res, { furniture }, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateFurnitureThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const file = req.file as Express.Multer.File | undefined;

    if (!file || !file.buffer) {
      sendError(res, 'No image file provided. Upload a JPEG, PNG, or WebP image.', 400);
      return;
    }

    try {
      validateImageUpload(file);
    } catch (e) {
      sendError(res, e instanceof Error ? e.message : 'Invalid image upload.', 400);
      return;
    }

    const saved = await saveUploadToPublicFolder({
      kind: 'thumbnails',
      buffer: file.buffer,
      originalname: file.originalname,
    });
    const resultUrl = `${getPublicBaseUrl(req)}${saved.relativeUrlPath}`;

    const thumbnailAlt = (req.body?.thumbnailAlt as string) || undefined;
    const furniture = await furnitureService.updateFurnitureThumbnail(id, {
      url: resultUrl,
      thumbnailAlt,
    });

    sendSuccess(res, { furniture }, 'Thumbnail updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getFurnitureDashboardSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await furnitureService.getFurnitureDashboardSummary();
    sendSuccess(res, { summary }, 'Furniture dashboard summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFeaturedFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const furniture = await furnitureService.getFeaturedFurniture(limit);
    sendSuccess(res, { furniture }, 'Featured furniture retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getRelatedFurniture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    const furniture = await furnitureService.getRelatedFurniture(id, limit);
    sendSuccess(res, { furniture }, 'Related furniture retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const advancedSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      search: search as string,
      category: category as FurnitureCategory,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      inStock: inStock === 'true',
      tags: tags ? (tags as string).split(',') : undefined,
    };

    const options = {
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await furnitureService.advancedSearch(filters, options);
    sendSuccess(res, result, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

