import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.util';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.util';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.registerUser(req.body);
    setRefreshTokenCookie(res, tokens.refreshToken);
    sendCreated(res, { user, accessToken: tokens.accessToken }, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.loginUser(req.body);
    setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const designerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.designerLoginUser(req.body);
    setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Designer login successful');
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, tokens } = await authService.adminLoginUser(req.body);
    setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Admin login successful');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken as string | undefined;
    if (!incomingToken) {
      sendError(res, 'Refresh token not provided', 401);
      return;
    }
    const { user, tokens } = await authService.refreshUserTokens(incomingToken);
    setRefreshTokenCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.id) {
      await authService.logoutUser(req.user.id);
    }
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};
