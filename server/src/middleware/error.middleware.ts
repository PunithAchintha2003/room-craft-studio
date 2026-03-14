import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0];
    message = `${field ?? 'Field'} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    const multerErr = err as { code?: string; field?: string; message?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') message = 'File too large. Maximum size is 5MB.';
    else if (multerErr.code === 'LIMIT_FILE_COUNT') message = 'Too many files. Upload one image.';
    else message = multerErr.message ?? 'File upload error';
  } else if (err.message?.startsWith('Invalid file type')) {
    statusCode = 400;
    message = err.message;
  }

  if (env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
