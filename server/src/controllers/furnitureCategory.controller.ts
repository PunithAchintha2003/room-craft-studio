import { Request, Response, NextFunction } from 'express';
import * as furnitureCategoryService from '../services/furnitureCategory.service';
import { sendCreated, sendSuccess, sendError } from '../utils/response.util';

export const getFurnitureCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await furnitureCategoryService.listCategories();
    sendSuccess(res, { categories }, 'Furniture categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createFurnitureCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const label = String(req.body?.label ?? '');
    if (!label.trim()) {
      sendError(res, 'Category name is required.', 400);
      return;
    }
    const category = await furnitureCategoryService.createCategory(label);
    sendCreated(res, { category }, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

