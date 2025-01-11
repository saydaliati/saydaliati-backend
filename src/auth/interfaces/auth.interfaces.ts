export interface UserCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  message: string;
}
export interface AuthResponse {
  User: UserData;
  tokens: TokenData;
}

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  isVerified: boolean;
}

export interface TokenData {
  idToken?: string
  accessToken?: string;
  refreshToken?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
