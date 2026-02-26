import { UserRole, User } from './auth.types';

export type { UserRole, User };

export interface UserListParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserUpdatePayload {
  role?: UserRole;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  totalDesigners: number;
  totalAdmins: number;
  activeUsers: number;
  activeDesigners: number;
}
