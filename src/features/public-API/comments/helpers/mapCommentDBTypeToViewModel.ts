import { ViewCommentType } from '../types/comments.types';

export const mapComment = (comment): ViewCommentType => ({
  id: comment.id.toString(),
  content: comment.content,
  commentatorInfo: {
    userId: comment.userId.toString(),
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: comment.likesCount,
    dislikesCount: comment.dislikesCount,
    myStatus: comment.myStatus || 'None',
  },
});
