import { IUserPayload } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export {};
