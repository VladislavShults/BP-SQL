import { ViewPostType } from '../types/posts.types';

export const mapPost = (post): ViewPostType => {
  let newestLikes = post.newestLikes;

  if (Number(post.likesCount) === 0) {
    newestLikes = [];
  }

  return {
    id: post.id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: Number(post.likesCount),
      dislikesCount: Number(post.dislikesCount),
      myStatus: post.myStatus || 'None',
      newestLikes,
    },
  };
};
