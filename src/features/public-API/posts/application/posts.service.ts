import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UpdatePostByBlogIdDto } from '../../../bloggers-API/blogs/api/models/update-postByBlogId.dto';
import { CreatePostBySpecificBlogDto } from '../../blogs/api/models/create-postBySpecificBlog.dto';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async updatePost(
    postId: string,
    inputModel: UpdatePostByBlogIdDto,
  ): Promise<void> {
    await this.postsRepository.updatePost(postId, inputModel);
  }

  async deletePostByIdForBlogId(postId: string, blogId: string): Promise<void> {
    await this.postsRepository.deletePostByIdForBlogId(postId, blogId);
  }

  async banOrUnbanPostsByBlog(blogId: string, banStatus: boolean) {
    await this.postsRepository.banAndUnbanPostsByBlog(blogId, banStatus);
  }

  async checkUserForBanByBlog(
    userId: string,
    postId: string,
  ): Promise<boolean> {
    const bannedUsersForBlogArray =
      await this.postsRepository.getBannedUsersForBlogByPostId(postId);

    if (bannedUsersForBlogArray.length === 0) return false;

    const userInBanArray = bannedUsersForBlogArray.find(
      (u) => u.id === Number(userId),
    );

    if (!userInBanArray) return false;
    else return true;
  }

  async createPost(
    blogId: string,
    inputModel: CreatePostBySpecificBlogDto,
    userId: string,
  ): Promise<string> {
    return await this.postsRepository.createPost(blogId, inputModel, userId);
  }
}
