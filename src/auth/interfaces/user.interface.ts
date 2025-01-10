import { UserRole } from "../enums/role.enum";

export interface IUser {
  uid: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isDeleted: boolean;
  isVerified: boolean;
}
