export type BannedUsersForBlogDBType = {
  userId: string;
  login: string;
  isBanned: boolean;
  banDate: Date;
  banReason: string;
  blogId: string;
};

export type BannedUsersForBlogViewType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: Date;
    banReason: string;
  };
};

export type BlogDBType = {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  userId: string;
  isBanned: boolean;
  banDate: Date;
  isMembership: boolean;
};

export type ViewBlogType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type ViewBlogByIdType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
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
  items: BannedUsersForBlogViewType[];
};
