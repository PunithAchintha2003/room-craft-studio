import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { IAuthTokens, ILoginInput, IRegisterInput, IUserPayload } from '../types/user.types';

const buildPayload = (user: IUser): IUserPayload => ({
  id: (user._id as unknown as string).toString(),
  email: user.email,
  role: user.role,
  name: user.name,
});

const generateTokens = (payload: IUserPayload): IAuthTokens => ({
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

export const registerUser = async (
  input: IRegisterInput
): Promise<{ user: IUser; tokens: IAuthTokens }> => {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    password: input.password,
    role: 'user',
  });

  const payload = buildPayload(user);
  const tokens = generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

export const loginUser = async (
  input: ILoginInput
): Promise<{ user: IUser; tokens: IAuthTokens }> => {
  const email = input.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const payload = buildPayload(user);
  const tokens = generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

export const designerLoginUser = async (
  input: ILoginInput
): Promise<{ user: IUser; tokens: IAuthTokens }> => {
  const email = input.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.role !== 'designer') {
    throw new AppError('Access denied. Designer account required.', 403);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const payload = buildPayload(user);
  const tokens = generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

export const adminLoginUser = async (
  input: ILoginInput
): Promise<{ user: IUser; tokens: IAuthTokens }> => {
  const email = input.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.role !== 'admin') {
    throw new AppError('Access denied. Admin account required.', 403);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const payload = buildPayload(user);
  const tokens = generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

export const refreshUserTokens = async (
  incomingRefreshToken: string
): Promise<{ user: IUser; tokens: IAuthTokens }> => {
  let decoded: IUserPayload;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const payload = buildPayload(user);
  const tokens = generateTokens(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (input.name !== undefined) {
    user.name = input.name.trim();
    if (user.name.length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }
  }
  if (input.email !== undefined) {
    const email = input.email.toLowerCase().trim();
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }
    user.email = email;
  }
  await user.save({ validateBeforeSave: true });
  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
};
