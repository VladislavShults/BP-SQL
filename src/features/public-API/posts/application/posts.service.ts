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

  // async makeLikeOrUnlike(
  //   postId: string,
  //   user,
  //   likeStatus: LikeType,
  // ): Promise<boolean> {
  //   const post = await this.postsRepository.getPostById(postId);
  //   if (!post) return false;
  //   if (likeStatus === 'Like') {
  //     return await this.makeLike(postId, user);
  //   }
  //   if (likeStatus === 'Dislike') {
  //     return await this.makeDislike(postId, user);
  //   }
  //   if (likeStatus === 'None') {
  //     return await this.resetLike(postId, user);
  //   }
  //   return true;
  // }

  // async makeLike(postId: string, user): Promise<boolean> {
  //   const post = await this.postsRepository.getPostById(postId);
  //   const myLike = await this.likesService.findLikeByUserIdAndPostId(
  //     user._id.toString(),
  //     postId,
  //   );
  //
  //   let myStatus: string;
  //   if (!myLike) myStatus = null;
  //   else myStatus = myLike.status;
  //
  //   if (post && myStatus === 'Dislike') {
  //     post.likesCount += 1;
  //     post.dislikesCount -= 1;
  //     myLike.addedAt = new Date();
  //     myLike.status = 'Like';
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   if (post && myStatus === null) {
  //     post.likesCount += 1;
  //     const like: Omit<LikeDBType, '_id'> = {
  //       idObject: post._id,
  //       userId: user._id,
  //       login: user.login,
  //       addedAt: new Date(),
  //       status: 'Like',
  //       postOrComment: 'post',
  //       isBanned: false,
  //     };
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.saveLikeOrUnlike(like);
  //     return true;
  //   }
  //   if (post && myStatus === 'None') {
  //     post.likesCount += 1;
  //     myLike.status = 'Like';
  //     myLike.addedAt = new Date();
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   return true;
  // }
  //
  // async makeDislike(postId: string, user): Promise<boolean> {
  //   const post = await this.postsRepository.getPostById(postId);
  //   const myLike = await this.likesService.findLikeByUserIdAndPostId(
  //     user._id.toString(),
  //     postId,
  //   );
  //
  //   let myStatus: string;
  //   if (!myLike) myStatus = null;
  //   else myStatus = myLike.status;
  //
  //   if (post && myStatus === 'Like') {
  //     post.likesCount -= 1;
  //     post.dislikesCount += 1;
  //     myLike.addedAt = new Date();
  //     myLike.status = 'Dislike';
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   if (post && myStatus === null) {
  //     post.dislikesCount += 1;
  //     const like: Omit<LikeDBType, '_id'> = {
  //       idObject: post._id,
  //       userId: user._id,
  //       login: user.login,
  //       addedAt: new Date(),
  //       status: 'Dislike',
  //       postOrComment: 'post',
  //       isBanned: false,
  //     };
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.saveLikeOrUnlike(like);
  //     return true;
  //   }
  //   if (post && myStatus === 'None') {
  //     post.dislikesCount += 1;
  //     myLike.status = 'Dislike';
  //     myLike.addedAt = new Date();
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   return true;
  // }
  //
  // async resetLike(postId: string, user): Promise<boolean> {
  //   const post = await this.postsRepository.getPostById(postId);
  //   const myLike = await this.likesService.findLikeByUserIdAndPostId(
  //     user._id.toString(),
  //     postId,
  //   );
  //
  //   let myStatus: string;
  //   if (!myLike) myStatus = null;
  //   else myStatus = myLike.status;
  //
  //   if (post && myStatus === 'Like') {
  //     post.likesCount -= 1;
  //     myLike.addedAt = new Date();
  //     myLike.status = 'None';
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   if (post && myStatus === 'Dislike') {
  //     post.dislikesCount -= 1;
  //     myLike.addedAt = new Date();
  //     myLike.status = 'None';
  //     await this.postsRepository.updatePost(post);
  //     await this.likesService.updateLike(myLike);
  //     return true;
  //   }
  //   return true;
  // }

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
