import { Injectable } from '@nestjs/common';
import { BannedUsersForBlogDBType } from '../types/blogs.types';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { CreateBlogDto } from '../api/models/create-blog.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateBlogDto } from '../api/models/update-blog.dto';
import { BanUserForBlogDto } from '../../../bloggers-API/users/api/models/ban-user-for-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteBlogById(blogId: string) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."Blogs"
    SET "IsDeleted"=true
    WHERE "BlogId" = $1;`,
        [blogId],
      );
    } catch (error) {
      return null;
    }
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

  async removeUserIdFromBannedListBlogs(userId: string, blogId: string) {
    await this.dataSource.query(
      `
    DELETE FROM public."BannedUsersForBlog"
    WHERE "UserId" = $1 AND "BlogId" = $2;`,
      [userId, blogId],
    );
  }

  async updateBlog(blogId: string, updateBlogDTO: UpdateBlogDto) {
    await this.dataSource.query(
      `
    UPDATE public."Blogs"
    SET "BlogName"=$1, "Description"=$2, "WebsiteUrl"=$3
    WHERE "BlogId" = $4;`,
      [
        updateBlogDTO.name,
        updateBlogDTO.description,
        updateBlogDTO.websiteUrl,
        blogId,
      ],
    );
  }

  async checkUserInBanListForBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const userInBanListForBlog = await this.findUserInBanListForBlog(
      userId,
      blogId,
    );

    if (!userInBanListForBlog) return false;
    else return true;
  }

  async findUserInBanListForBlog(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersForBlogDBType> | null {
    const userInBanListForBlog = await this.dataSource.query(
      `
    SELECT "UserId" as "userId", "IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason", "BlogId" as "blogId"
    FROM public."BannedUsersForBlog"
    WHERE "UserId" = $1 AND "BlogId" = $2`,
      [userId, blogId],
    );

    if (userInBanListForBlog.length === 0) return null;
    else return userInBanListForBlog[0];
  }

  async addUserToBanList(userId: string, inputModel: BanUserForBlogDto) {
    await this.dataSource.query(
      `
    INSERT INTO public."BannedUsersForBlog"(
        "UserId", "IsBanned", "BanReason", "BlogId")
    VALUES ($1, $2, $3, $4);`,
      [userId, inputModel.isBanned, inputModel.banReason, inputModel.blogId],
    );
  }

  async banOrUnbanBlog(blogId: string, banStatus: boolean, date: Date | null) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."Blogs"
    SET "IsBanned"=$1, "BanDate"=$2
    WHERE "BlogId" = $3;`,
        [banStatus, date, blogId],
      );
    } catch (error) {
      return null;
    }
  }
}
