import { Request, Response, NextFunction } from 'express';
import * as furnitureService from '../services/furniture.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.util';
import { FurnitureCategory } from '../types/design.types';
import { uploadImageBuffer } from '../utils/imageUpload';

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

    const result = await uploadImageBuffer(file.buffer, {
      mimetype: file.mimetype,
    });

    const thumbnailAlt = (req.body?.thumbnailAlt as string) || undefined;
    const furniture = await furnitureService.updateFurnitureThumbnail(id, {
      url: result.url,
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

