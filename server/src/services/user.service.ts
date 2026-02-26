import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { UserRole } from '../types/user.types';

export interface UserListQuery {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserUpdateInput {
  role?: UserRole;
  isActive?: boolean;
}

export const listUsers = async (query: UserListQuery) => {
  const { role, isActive, search, page = 1, limit = 20 } = query;

  const filter: Record<string, unknown> = {};
  if (role) filter['role'] = role;
  if (isActive !== undefined) filter['isActive'] = isActive;
  if (search) {
    filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit };
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUser = async (id: string, input: UserUpdateInput) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  // Admin can only update role and isActive; name and email are not editable by admin
  if (input.role !== undefined) user.role = input.role;
  if (input.isActive !== undefined) user.isActive = input.isActive;

  await user.save({ validateBeforeSave: true });
  return user;
};

export const getUserStats = async () => {
  const [totalUsers, totalDesigners, totalAdmins, activeUsers, activeDesigners] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'designer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'designer', isActive: true }),
    ]);

  return { totalUsers, totalDesigners, totalAdmins, activeUsers, activeDesigners };
};
