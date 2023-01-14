import { ObjectId } from 'mongodb';

export type UserDBType = {
  _id: ObjectId;
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
    banReason: string | null;
  };
};

export type ViewUserType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: {
    isBanned: boolean;
    banDate: Date;
    banReason: string;
  };
};

export type ViewUsersTypeWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewUserType[];
};

export type EmailConfirmationType = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  userId: number;
};

export type UserForTypeOrmType = {
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
};

export type UserSQLType = {
  UserId: number;
  Login: string;
  Email: string;
  CreatedAt: Date;
  PasswordHash: string;
};

export type UsersJoinBanInfoType = {
  id: number;
  login: string;
  email: string;
  createdAt: Date;
  isBanned: boolean;
  banReason: string;
  banDate: Date;
};

export type UsersJoinEmailConfirmationType = {
  id: number;
  login: string;
  email: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
};

export type UsersForCheckInDB = {
  userId: number;
  login: string;
  email: string;
  passwordHash: string;
  isBanned: boolean;
};
