export interface User {
  uid: string;
  email: string;
  password: string;
  username: string;
  role: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isDeleted: boolean;
  isVerified: boolean;
}
