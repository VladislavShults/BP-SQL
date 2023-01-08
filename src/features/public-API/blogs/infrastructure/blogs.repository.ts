import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BannedUsersForBlogType, BlogDBType } from '../types/blogs.types';

@Injectable()
export class BlogsRepository {
  constructor(
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogType>,
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
  ) {}
  getBlogById(blogId: string) {
    return this.blogModel.findById(blogId);
  }

  deleteBlogById(blogId: string) {
    return this.blogModel.deleteOne({ _id: blogId });
  }

  async updateBlog(blog) {
    await blog.save();
  }

  async createBlog(newBlog: Omit<BlogDBType, '_id'>): Promise<string> {
    const blog = await this.blogModel.create(newBlog);
    return blog._id.toString();
  }

  async saveBannedUserForBlog(bannedUser: BannedUsersForBlogType) {
    await this.bannedUserForBlogModel.create(bannedUser);
  }

  async removeUserIdFromBannedUsersInBannedModel(
    userId: string,
    blogId: string,
  ) {
    await this.bannedUserForBlogModel.deleteOne({ id: userId, blogId: blogId });
  }

  async deleteUserIdFromBannedUsersInBlog(blogId: string, userId: string) {
    await this.blogModel.updateOne(
      { _id: blogId },
      { $pull: { bannedUsers: userId } },
    );
  }
}
