import webpush from 'web-push';
import { Notification, INotification } from '../models/notification.model';
import { PushSubscriptionModel } from '../models/pushSubscription.model';
import { AppError } from '../utils/AppError';
import { emitToUser } from '../lib/socket';
import { env } from '../config/env';
import {
  ICreateNotificationInput,
  INotificationQueryOptions,
  INotificationPayload,
} from '../types/notification.types';

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${env.VAPID_CONTACT_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

const toPayload = (doc: INotification): INotificationPayload => ({
  _id: (doc._id as unknown as string).toString(),
  userId: doc.userId.toString(),
  title: doc.title,
  body: doc.body,
  type: doc.type,
  read: doc.read,
  link: doc.link,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

const sendWebPush = async (userId: string, payload: INotificationPayload): Promise<void> => {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;

  const subscriptions = await PushSubscriptionModel.find({ userId });
  if (!subscriptions.length) return;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    type: payload.type,
    link: payload.link,
    notificationId: payload._id,
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await PushSubscriptionModel.deleteOne({ _id: sub._id });
        }
      }
    })
  );
};

export const createForUser = async (
  userId: string,
  input: ICreateNotificationInput
): Promise<INotificationPayload> => {
  const doc = await Notification.create({ userId, ...input });
  const payload = toPayload(doc);

  emitToUser(userId, 'notification', payload);
  await sendWebPush(userId, payload);

  return payload;
};

export const createForUsers = async (
  userIds: string[],
  input: ICreateNotificationInput
): Promise<INotificationPayload[]> => {
  const docs = await Notification.insertMany(userIds.map((userId) => ({ userId, ...input })));
  const payloads = (docs as unknown as INotification[]).map(toPayload);

  payloads.forEach((payload) => {
    emitToUser(payload.userId, 'notification', payload);
    void sendWebPush(payload.userId, payload);
  });

  return payloads;
};

export const getByUserId = async (
  userId: string,
  options: INotificationQueryOptions = {}
): Promise<{ notifications: INotificationPayload[]; total: number; unreadCount: number }> => {
  const { page = 1, limit = 20, read } = options;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId };
  if (typeof read === 'boolean') filter['read'] = read;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, read: false }),
  ]);

  return {
    notifications: (notifications as unknown as INotification[]).map(toPayload),
    total,
    unreadCount,
  };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, read: false });
};

export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotificationPayload> => {
  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
  if (!doc) {
    throw new AppError('Notification not found', 404);
  }
  return toPayload(doc);
};

export const markAllAsRead = async (userId: string): Promise<{ modifiedCount: number }> => {
  const result = await Notification.updateMany({ userId, read: false }, { read: true });
  return { modifiedCount: result.modifiedCount };
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const doc = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!doc) {
    throw new AppError('Notification not found', 404);
  }
};

export const savePushSubscription = async (
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
  userAgent?: string
): Promise<void> => {
  await PushSubscriptionModel.findOneAndUpdate(
    { userId, endpoint },
    { userId, endpoint, p256dh, auth, userAgent },
    { upsert: true, new: true }
  );
};

export const removePushSubscription = async (
  userId: string,
  endpoint: string
): Promise<void> => {
  await PushSubscriptionModel.deleteOne({ userId, endpoint });
};
