import { ObjectId } from 'mongodb';
import { LikeType } from '../../likes/types/likes.types';

export type CommentDBType = {
  _id: ObjectId;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  postId: string;
  likesCount: number;
  dislikesCount: number;
  isBanned: boolean;
  blogId: string;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
    postOwnerUserId: string;
  };
};

type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeType;
};

export type ViewCommentType = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  likesInfo: LikesInfoType;
};

type PaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};

type ItemsForViewCommentType = {
  items: ViewCommentType[];
};

export type ViewCommentsTypeWithPagination = PaginationType &
  ItemsForViewCommentType;

export type AllCommentsForAllPostType = {
  id: string;
  content: string;
  createdAt: Date;
  likesInfo: LikesInfoType;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
};

type ItemsAllCommentForAllPosts = {
  items: AllCommentsForAllPostType[];
};

export type ViewAllCommentsForAllPostsWithPaginationType = PaginationType &
  ItemsAllCommentForAllPosts;
