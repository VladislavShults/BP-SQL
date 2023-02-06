import { Inject, Injectable } from '@nestjs/common';
import { PostDBType } from '../types/posts.types';
import { Model } from 'mongoose';
import { CreatePostBySpecificBlogDto } from '../../blogs/api/models/create-postBySpecificBlog.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdatePostByBlogIdDto } from '../../../bloggers-API/blogs/api/models/update-postByBlogId.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @Inject('POST_MODEL')
    private readonly postModel: Model<PostDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getPostById(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) return null;
    return post;
  }

  async deletePostByIdForBlogId(postId: string, blogId: string): Promise<void> {
    try {
      await this.dataSource.query(
        `
    UPDATE public."Posts"
    SET  "IsDeleted"=true
    WHERE "PostId"=$1 AND "BlogId"=$2;`,
        [postId, blogId],
      );
    } catch (error) {
      return null;
    }
  }

  async banPosts(userId: string) {
    await this.postModel.updateMany(
      { userId: userId },
      { $set: { isBanned: true } },
    );
  }

  async unbanPosts(userId: string) {
    await this.postModel.updateMany(
      { userId: userId },
      { $set: { isBanned: false } },
    );
  }

  async banAndUnbanPostsByBlog(blogId: string, banStatus: boolean) {
    await this.dataSource.query(
      `
    UPDATE public."Posts"
    SET "IsBanned"=$1
    WHERE "BlogId" = $2;`,
      [banStatus, blogId],
    );
  }

  async createPost(
    blogId: string,
    inputModel: CreatePostBySpecificBlogDto,
    userId: string,
  ): Promise<string> {
    const idArr = await this.dataSource.query(
      `
    INSERT INTO public."Posts"(
            "Title", "ShortDescription", "Content", "BlogId", "userId")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "PostId" as "id";`,
      [
        inputModel.title,
        inputModel.shortDescription,
        inputModel.content,
        blogId,
        userId,
      ],
    );
    return idArr[0].id;
  }

  async updatePost(postId: string, inputModel: UpdatePostByBlogIdDto) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."Posts"
    SET "Title"=$1, "ShortDescription"=$2, "Content"=$3
    WHERE "PostId" = $4
    AND "IsDeleted" = false;`,
        [
          inputModel.title,
          inputModel.shortDescription,
          inputModel.content,
          postId,
        ],
      );
    } catch (error) {
      return null;
    }
  }

  async getBannedUsersForBlogByPostId(
    postId: string,
  ): Promise<{ id: number }[]> {
    let bannedUsers = [];

    try {
      bannedUsers = await this.dataSource.query(
        `
    SELECT bu."UserId" as "id"
    FROM public."BannedUsersForBlog" bu
    JOIN public."Posts" p
    ON bu."BlogId" = p."BlogId"
    WHERE p."PostId" = $1`,
        [postId],
      );
    } catch (error) {}

    return bannedUsers;
  }
}
