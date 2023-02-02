import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { LikesService } from '../../likes/application/likes.service';
import { UpdatePostByBlogIdDto } from '../../../bloggers-API/blogs/api/models/update-postByBlogId.dto';
import { BlogsQueryRepository } from '../../blogs/api/blogs.query.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { CreatePostBySpecificBlogDto } from '../../blogs/api/models/create-postBySpecificBlog.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async updatePost(
    postId: string,
    inputModel: UpdatePostByBlogIdDto,
  ): Promise<void> {
    await this.postsRepository.updatePost(postId, inputModel);
  }

  async deletePostByIdForBlogId(postId: string, blogId: string): Promise<void> {
    await this.postsRepository.deletePostByIdForBlogId(postId, blogId);
  }

  async banPosts(userId: string) {
    await this.postsRepository.banPosts(userId);
  }

  async unbanPosts(userId: string) {
    await this.postsRepository.unbanPosts(userId);
  }

  // async correctLikeAndDislikeCountersBan(postId: string, status: LikeType) {
  //   const post = await this.postsRepository.getPostById(postId.toString());
  //   if (status === 'Like') post.likesCount -= 1;
  //   if (status === 'Dislike') post.dislikesCount -= 1;
  //   await this.postsRepository.updatePost(post);
  // }

  // async correctLikeAndDislikeCountersUnban(postId: string, status: LikeType) {
  //   const post = await this.postsRepository.getPostById(postId.toString());
  //   if (status === 'Like') post.likesCount += 1;
  //   if (status === 'Dislike') post.dislikesCount += 1;
  //   await this.postsRepository.updatePost(post);
  // }

  async getPostById(postId: string) {
    return this.postsRepository.getPostById(postId);
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
