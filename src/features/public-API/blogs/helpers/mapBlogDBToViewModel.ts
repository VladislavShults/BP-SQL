import { BlogDBTypeWithoutBlogOwner, ViewBlogType } from '../types/blogs.types';

export const mapBlog = (blog: BlogDBTypeWithoutBlogOwner): ViewBlogType => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
});
