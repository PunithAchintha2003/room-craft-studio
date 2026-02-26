import api from './api';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  body?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

export interface GetNotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

export const getMyNotifications = async (
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse> => {
  const { data } = await api.get<{ data: GetNotificationsResponse }>('/notifications/me', {
    params,
  });
  return data.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get<{ data: { count: number } }>('/notifications/me/unread-count');
  return data.data.count;
};

export const markAsRead = async (id: string): Promise<NotificationItem> => {
  const { data } = await api.patch<{ data: { notification: NotificationItem } }>(
    `/notifications/${id}/read`
  );
  return data.data.notification;
};

export const markAllAsRead = async (): Promise<{ modifiedCount: number }> => {
  const { data } = await api.patch<{ data: { modifiedCount: number } }>(
    '/notifications/me/read-all'
  );
  return data.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const savePushSubscription = async (subscription: PushSubscription): Promise<void> => {
  const sub = subscription.toJSON();
  await api.post('/notifications/push-subscription', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: sub.keys?.['p256dh'],
      auth: sub.keys?.['auth'],
    },
  });
};

export const removePushSubscription = async (endpoint: string): Promise<void> => {
  await api.delete('/notifications/push-subscription', { data: { endpoint } });
};
