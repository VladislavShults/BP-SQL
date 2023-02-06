import { LikesInfoType, ViewCommentType } from '../types/comments.types';

export const mapComment = (
  comment,
): ViewCommentType & { likesInfo: LikesInfoType } => ({
  id: comment.id.toString(),
  content: comment.content,
  commentatorInfo: {
    userId: comment.userId.toString(),
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: Number(comment.likesCount),
    dislikesCount: Number(comment.dislikesCount),
    myStatus: comment.myStatus || 'None',
  },
});
