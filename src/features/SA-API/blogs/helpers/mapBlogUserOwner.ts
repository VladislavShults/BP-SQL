import {
  IsMembership,
  ViewBlogWithUserOwnerType,
} from '../types/admin.blogs.types';

export const mapBlogUserOwner = (
  blog,
): ViewBlogWithUserOwnerType & IsMembership => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
  blogOwnerInfo: {
    userId: blog.userId,
    userLogin: blog.userLogin,
  },
  banInfo: {
    isBanned: blog.isBanned,
    banDate: blog.banDate,
  },
});
