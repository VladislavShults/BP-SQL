import { BlogDBType, ViewBlogByIdType } from '../types/blogs.types';

export const mapBlogById = (blog: BlogDBType): ViewBlogByIdType => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

export const mapBlogByIdWithUserId = (
  blog: BlogDBType,
): ViewBlogByIdType & { userId: string } => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  userId: blog.userId.toString(),
  isMembership: blog.isMembership,
});
