import { BlogDBTypeWithoutBlogOwner, ViewBlogType } from '../types/blogs.types';

export const mapBlog = (blog: BlogDBTypeWithoutBlogOwner): ViewBlogType => ({
  id: blog.id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
});
