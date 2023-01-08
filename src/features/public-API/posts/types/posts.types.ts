import { ObjectId } from 'mongodb';

export type PostDBType = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  userId: string;
  isBanned: boolean;
};

export type NewestLikesType = {
  addedAt: Date;
  userId: string;
  login: string;
};

type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: NewestLikesType[];
};

export type ViewPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoType;
};

export type ViewPostWithoutLikesType = Omit<ViewPostType, 'extendedLikesInfo'>;

export type ViewPostsTypeWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewPostType[];
};
