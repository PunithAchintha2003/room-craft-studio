import { Types } from 'mongoose';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface ICreateNotificationInput {
  title: string;
  body?: string;
  type?: NotificationType;
  link?: string;
}

export interface ICreateNotificationForUserInput extends ICreateNotificationInput {
  userId: string | Types.ObjectId;
}

export interface ICreateNotificationForUsersInput extends ICreateNotificationInput {
  userIds: string[] | Types.ObjectId[];
}

export interface INotificationQueryOptions {
  page?: number;
  limit?: number;
  read?: boolean;
}

export interface INotificationPayload {
  _id: string;
  userId: string;
  title: string;
  body?: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}
