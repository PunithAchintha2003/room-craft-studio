import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as notificationService from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response.util';

const createSchema = z.object({
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  title: z.string().min(1).max(200),
  body: z.string().max(1000).optional(),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  link: z.string().url().optional(),
}).refine((d) => d.userId || (d.userIds && d.userIds.length > 0), {
  message: 'Either userId or userIds must be provided',
});

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
      return;
    }

    const { userId, userIds, title, body, type, link } = parsed.data;

    if (userIds && userIds.length > 0) {
      const notifications = await notificationService.createForUsers(userIds, {
        title,
        body,
        type,
        link,
      });
      sendSuccess(res, { notifications, count: notifications.length }, 'Notifications sent', 201);
    } else {
      const notification = await notificationService.createForUser(userId!, {
        title,
        body,
        type,
        link,
      });
      sendSuccess(res, { notification }, 'Notification sent', 201);
    }
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10)));
    const readParam = req.query['read'];
    const read =
      readParam === 'true' ? true : readParam === 'false' ? false : undefined;

    const result = await notificationService.getByUserId(userId, { page, limit, read });
    sendSuccess(res, result, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count }, 'Unread count retrieved');
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    const notification = await notificationService.markAsRead(id, req.user!.id);
    sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleteId = Array.isArray(req.params['id']) ? req.params['id'][0]! : req.params['id']!;
    await notificationService.deleteNotification(deleteId, req.user!.id);
    sendSuccess(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

export const subscribePush = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = pushSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'Invalid push subscription', 400, parsed.error.flatten().fieldErrors);
      return;
    }

    const { endpoint, keys } = parsed.data;
    const userAgent = req.headers['user-agent'];

    await notificationService.savePushSubscription(
      req.user!.id,
      endpoint,
      keys.p256dh,
      keys.auth,
      userAgent
    );

    sendSuccess(res, null, 'Push subscription saved', 201);
  } catch (err) {
    next(err);
  }
};

export const unsubscribePush = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { endpoint } = req.body as { endpoint?: string };
    if (!endpoint) {
      sendError(res, 'endpoint is required', 400);
      return;
    }
    await notificationService.removePushSubscription(req.user!.id, endpoint);
    sendSuccess(res, null, 'Push subscription removed');
  } catch (err) {
    next(err);
  }
};
