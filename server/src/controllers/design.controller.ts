import { Request, Response, NextFunction } from 'express';
import * as designService from '../services/design.service';
import { sendSuccess, sendCreated } from '../utils/response.util';
import { AppError } from '../utils/AppError';

export const createDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const design = await designService.createDesign(req.user!.id, req.body);
    sendCreated(res, { design }, 'Design created successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserDesigns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designs =
      req.user!.role === 'admin'
        ? await designService.getAllDesignsForAdmin()
        : await designService.getUserDesigns(req.user!.id);
    sendSuccess(res, { designs }, 'Designs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDesignById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const design = await designService.getDesignById(
      id,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, { design }, 'Design retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPublicDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const design = await designService.getPublicDesign(id);
    sendSuccess(res, { design }, 'Design retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const design = await designService.updateDesign(
      id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    sendSuccess(res, { design }, 'Design updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await designService.deleteDesign(id, req.user!.id, req.user!.role);
    sendSuccess(res, null, 'Design deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const duplicateDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const design = await designService.duplicateDesign(id, req.user!.id);
    sendCreated(res, { design }, 'Design duplicated successfully');
  } catch (error) {
    next(error);
  }
};

export const getPreviewDesign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const furnitureId = req.query.furnitureId as string | undefined;

    if (!furnitureId) {
      throw new AppError('furnitureId query parameter is required for preview', 400);
    }

    const design = await designService.getPreviewDesign(furnitureId);
    sendSuccess(res, { design }, 'Preview design generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getDesignDashboardSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await designService.getDesignDashboardSummary();
    sendSuccess(res, { summary }, 'Design dashboard summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

