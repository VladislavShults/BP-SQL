import { BlogDBType, ViewBlogByIdType } from '../types/blogs.types';

export const mapBlogById = (blog: BlogDBType): ViewBlogByIdType => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
});
