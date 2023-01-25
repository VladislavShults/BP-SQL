import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import { ViewBlogWithUserOwnerType } from '../types/admin.blogs.types';

export const mapBlogUserOwner = (blog): ViewBlogWithUserOwnerType => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  blogOwnerInfo: {
    userId: blog.userId,
    userLogin: blog.userLogin,
  },
  banInfo: {
    isBanned: blog.isBanned,
    banDate: blog.banDate,
  },
});
