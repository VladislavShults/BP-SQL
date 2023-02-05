import { AllCommentsForAllPostType } from '../types/comments.types';

export const mapCommentDBTypeToAllCommentForAllPosts = (
  comment,
): AllCommentsForAllPostType => ({
  id: comment.id.toString(),
  content: comment.content,
  createdAt: comment.createdAt,
  // likesInfo: {
  //   likesCount: comment.likesCount,
  //   dislikesCount: comment.dislikesCount,
  //   myStatus: 'None',
  // },
  commentatorInfo: {
    userId: comment.userId,
    userLogin: comment.userLogin,
  },
  postInfo: {
    id: comment.postId,
    title: comment.title,
    blogId: comment.blogId,
    blogName: comment.blogName,
  },
});
