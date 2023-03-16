import { AllCommentsForAllPostType } from '../types/comments.types';

export const mapCommentDBTypeToAllCommentForAllPosts = (
  comment,
): AllCommentsForAllPostType => ({
  id: comment.id.toString(),
  content: comment.content,
  createdAt: comment.createdAt,
  commentatorInfo: {
    userId: comment.userId.toString(),
    userLogin: comment.userLogin,
  },
  likesInfo: {
    likesCount: Number(comment.likesCount),
    dislikesCount: Number(comment.dislikesCount),
    myStatus: comment.myStatus || 'None',
  },
  postInfo: {
    blogId: comment.blogId.toString(),
    blogName: comment.blogName,
    title: comment.title,
    id: comment.postId.toString(),
  },
});
