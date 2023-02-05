import { LikeType } from '../../likes/types/likes.types';

export type CommentDBType = {
  id: number;
  content: string;
  userId: string;
  createdAt: Date;
  postId: string;
  isBanned: boolean;
};

export type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeType;
};

export type ViewCommentType = Omit<AllCommentsForAllPostType, 'postInfo'>;

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
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  // likesInfo: LikesInfoType;
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
