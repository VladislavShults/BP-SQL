import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BannedUsersForBlogType, BlogDBType } from '../types/blogs.types';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { CreateBlogDto } from '../api/models/create-blog.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogType>,
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
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

  async createBlog(
    createBlogDto: CreateBlogDto,
    user: UserDBType,
  ): Promise<string> {
    const blogId = await this.dataSource.query(
      `
    INSERT INTO public."Blogs"(
        "BlogName", "Description", "WebsiteUrl", "UserId")
    VALUES ($1, $2, $3, $4)
    RETURNING "BlogId"  as "blogId"`,
      [
        createBlogDto.name,
        createBlogDto.description,
        createBlogDto.websiteUrl,
        user.id,
      ],
    );
    return blogId[0].blogId;
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
