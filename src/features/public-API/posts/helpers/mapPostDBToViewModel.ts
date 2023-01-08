import { PostDBType, ViewPostType } from '../types/posts.types';

export const mapPost = (post: PostDBType): ViewPostType => ({
  id: post._id.toString(),
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
  extendedLikesInfo: {
    likesCount: post.likesCount,
    dislikesCount: post.dislikesCount,
    myStatus: 'None',
    newestLikes: [],
  },
});
