export type ViewBlogWithUserOwnerType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
  };
};

export type IsMemberShip = {
  isMemberShip: boolean;
};

export type ViewBlogsTypeWithUserOwnerPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewBlogWithUserOwnerType[];
};
