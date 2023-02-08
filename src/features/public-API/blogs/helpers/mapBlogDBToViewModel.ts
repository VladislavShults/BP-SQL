import { BlogDBType, ViewBlogType } from '../types/blogs.types';

export const mapBlog = (blog: BlogDBType): ViewBlogType => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});
