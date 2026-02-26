import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUserPayload } from '../types/user.types';

export const signAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IUserPayload;
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as IUserPayload;
};
