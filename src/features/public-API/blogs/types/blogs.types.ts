import { ObjectId } from 'mongodb';

export type BlogDBTypeWithoutBlogOwner = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
};

export type BannedUsersForBlogType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: Date;
    banReason: string;
  };
  blogId: string;
};

export type BlogDBType = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  isBanned: boolean;
  banDate: Date;
  bannedUsers: string[];
};

export type ViewBlogType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
};

export type ViewBlogByIdType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
};

export type ViewBlogsTypeWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewBlogType[];
};

export type ViewBannedUsersForBlogWithPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Omit<BannedUsersForBlogType, 'blogId'>[];
};
