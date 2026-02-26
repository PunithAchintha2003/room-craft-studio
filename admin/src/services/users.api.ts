import api from './api';
import { UserListParams, UserListResponse, UserUpdatePayload, UserStats } from '@/types/user.types';
import { User } from '@/types/auth.types';

export const fetchUsers = async (params: UserListParams = {}): Promise<UserListResponse> => {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const { data } = await api.get<{ data: UserListResponse }>(`/users?${query.toString()}`);
  return data.data;
};

export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await api.get<{ data: { user: User } }>(`/users/${id}`);
  return data.data.user;
};

export const updateUser = async (id: string, payload: UserUpdatePayload): Promise<User> => {
  const { data } = await api.patch<{ data: { user: User } }>(`/users/${id}`, payload);
  return data.data.user;
};

export const fetchUserStats = async (): Promise<UserStats> => {
  const { data } = await api.get<{ data: UserStats }>('/users/stats');
  return data.data;
};
