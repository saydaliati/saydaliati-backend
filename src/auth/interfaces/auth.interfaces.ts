export interface UserCredentials {
  email: string;
  password: string;
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
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
