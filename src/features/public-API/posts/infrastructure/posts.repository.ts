import { Inject, Injectable } from '@nestjs/common';
import { PostDBType } from '../types/posts.types';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsRepository {
  constructor(
    @Inject('POST_MODEL')
    private readonly postModel: Model<PostDBType>,
  ) {}
  async createPost(post: Omit<PostDBType, '_id'>): Promise<ObjectId> {
    const newPost = await this.postModel.create(post);
    return newPost._id;
  }

  async getPostById(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) return null;
    return post;
  }

  async updatePost(post): Promise<boolean> {
    const result = await post.save();
    return result.modifiedPaths.length > 0;
  }

  async deletePostByIdForBlogId(
    postId: string,
    blogId: string,
  ): Promise<boolean> {
    const result = await this.postModel.deleteOne({
      _id: postId,
      blogId: blogId,
    });
    return result.deletedCount > 0;
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
    await this.postModel.updateMany(
      { blogId: blogId },
      { $set: { isBanned: banStatus } },
    );
  }
}
