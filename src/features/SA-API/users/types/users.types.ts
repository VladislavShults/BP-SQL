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
