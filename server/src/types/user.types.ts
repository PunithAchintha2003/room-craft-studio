export type UserRole = 'admin' | 'designer' | 'user';

export interface IUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}
