import {
  AllCommentsForAllPostType,
  CommentDBType,
} from '../types/comments.types';

export const mapCommentDBTypeToAllCommentForAllPosts = (
  comment: CommentDBType,
): AllCommentsForAllPostType => ({
  id: comment._id.toString(),
  content: comment.content,
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: comment.likesCount,
    dislikesCount: comment.dislikesCount,
    myStatus: 'None',
  },
  commentatorInfo: {
    userId: comment.userId,
    userLogin: comment.userLogin,
  },
  postInfo: {
    id: comment.postInfo.id,
    title: comment.postInfo.title,
    blogId: comment.postInfo.blogId,
    blogName: comment.postInfo.blogName,
  },
});
