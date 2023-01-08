import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import { ViewBlogWithUserOwnerType } from '../types/admin.blogs.types';

export const mapBlogUserOwner = (
  blog: BlogDBType,
): ViewBlogWithUserOwnerType => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  blogOwnerInfo: {
    userId: blog.blogOwnerInfo.userId,
    userLogin: blog.blogOwnerInfo.userLogin,
  },
  banInfo: {
    isBanned: blog.isBanned,
    banDate: blog.banDate,
  },
});
