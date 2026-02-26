import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response.util';
import { UserRole } from '../types/user.types';

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, isActive, search, page, limit } = req.query;

    const result = await userService.listUsers({
      role: role as UserRole | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    sendSuccess(res, result, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
  const user = await userService.getUserById(id);
    sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as { role?: UserRole; isActive?: boolean };

    const updateId = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const payload: Parameters<typeof userService.updateUser>[1] = {};
    if (body.role !== undefined) payload.role = body.role;
    if (body.isActive !== undefined) payload.isActive = body.isActive;

    const user = await userService.updateUser(updateId, payload);

    sendSuccess(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await userService.getUserStats();
    sendSuccess(res, stats, 'Stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};
