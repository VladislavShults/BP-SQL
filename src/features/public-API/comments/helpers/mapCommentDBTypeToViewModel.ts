import { CommentDBType, ViewCommentType } from '../types/comments.types';

export const mapComment = (comment: CommentDBType): ViewCommentType => ({
  id: comment._id.toString(),
  content: comment.content,
  userId: comment.userId,
  userLogin: comment.userLogin,
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: comment.likesCount,
    dislikesCount: comment.dislikesCount,
    myStatus: 'None',
  },
});
