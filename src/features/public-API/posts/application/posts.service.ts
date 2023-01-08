import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDto } from '../api/models/create-post.dto';
import { ObjectId } from 'mongodb';
import { PostDBType } from '../types/posts.types';
import { UpdatePostDto } from '../api/models/update-post.dto';
import { LikesService } from '../../likes/application/likes.service';
import { LikeDBType, LikeType } from '../../likes/types/likes.types';
import { URIParamsUpdateDto } from '../../../bloggers-API/blogs/api/models/URI-params-update.dto';
import { UpdatePostByBlogIdDto } from '../../../bloggers-API/blogs/api/models/update-postByBlogId.dto';
import { BlogsQueryRepository } from '../../blogs/api/blogs.query.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(
    createPostDTO: CreatePostDto,
    userId: string,
  ): Promise<ObjectId> {
    const post: Omit<PostDBType, '_id'> = {
      title: createPostDTO.title,
      shortDescription: createPostDTO.shortDescription,
      content: createPostDTO.content,
      blogId: createPostDTO.blogId,
      blogName: await this.blogsQueryRepository.getLoginBloggerByBlogId(
        createPostDTO.blogId,
      ),
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
      isBanned: false,
      userId: userId,
    };
    return await this.postsRepository.createPost(post);
  }

  async updatePost(
    postId: string,
    inputModel: UpdatePostDto,
  ): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) return false;
    post.title = inputModel.title;
    post.shortDescription = inputModel.shortDescription;
    post.content = inputModel.content;
    return await this.postsRepository.updatePost(post);
  }

  async makeLikeOrUnlike(
    postId: string,
    user,
    likeStatus: LikeType,
  ): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) return false;
    if (likeStatus === 'Like') {
      return await this.makeLike(postId, user);
    }
    if (likeStatus === 'Dislike') {
      return await this.makeDislike(postId, user);
    }
    if (likeStatus === 'None') {
      return await this.resetLike(postId, user);
    }
    return true;
  }

  async makeLike(postId: string, user): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    const myLike = await this.likesService.findLikeByUserIdAndPostId(
      user._id.toString(),
      postId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (post && myStatus === 'Dislike') {
      post.likesCount += 1;
      post.dislikesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'Like';
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (post && myStatus === null) {
      post.likesCount += 1;
      const like: Omit<LikeDBType, '_id'> = {
        idObject: post._id,
        userId: user._id,
        login: user.login,
        addedAt: new Date(),
        status: 'Like',
        postOrComment: 'post',
        isBanned: false,
      };
      await this.postsRepository.updatePost(post);
      await this.likesService.saveLikeOrUnlike(like);
      return true;
    }
    if (post && myStatus === 'None') {
      post.likesCount += 1;
      myLike.status = 'Like';
      myLike.addedAt = new Date();
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  async makeDislike(postId: string, user): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    const myLike = await this.likesService.findLikeByUserIdAndPostId(
      user._id.toString(),
      postId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (post && myStatus === 'Like') {
      post.likesCount -= 1;
      post.dislikesCount += 1;
      myLike.addedAt = new Date();
      myLike.status = 'Dislike';
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (post && myStatus === null) {
      post.dislikesCount += 1;
      const like: Omit<LikeDBType, '_id'> = {
        idObject: post._id,
        userId: user._id,
        login: user.login,
        addedAt: new Date(),
        status: 'Dislike',
        postOrComment: 'post',
        isBanned: false,
      };
      await this.postsRepository.updatePost(post);
      await this.likesService.saveLikeOrUnlike(like);
      return true;
    }
    if (post && myStatus === 'None') {
      post.dislikesCount += 1;
      myLike.status = 'Dislike';
      myLike.addedAt = new Date();
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  async resetLike(postId: string, user): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    const myLike = await this.likesService.findLikeByUserIdAndPostId(
      user._id.toString(),
      postId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (post && myStatus === 'Like') {
      post.likesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'None';
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (post && myStatus === 'Dislike') {
      post.dislikesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'None';
      await this.postsRepository.updatePost(post);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  createUpdateModel(
    params: URIParamsUpdateDto,
    inputModel: UpdatePostByBlogIdDto,
  ): UpdatePostDto {
    return {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: params.blogId,
    };
  }

  async deletePostByIdForBlogId(
    postId: string,
    blogId: string,
  ): Promise<boolean> {
    return this.postsRepository.deletePostByIdForBlogId(postId, blogId);
  }

  async banPosts(userId: string) {
    await this.postsRepository.banPosts(userId);
  }

  async unbanPosts(userId: string) {
    await this.postsRepository.unbanPosts(userId);
  }

  async correctLikeAndDislikeCountersBan(postId: string, status: LikeType) {
    const post = await this.postsRepository.getPostById(postId.toString());
    if (status === 'Like') post.likesCount -= 1;
    if (status === 'Dislike') post.dislikesCount -= 1;
    await this.postsRepository.updatePost(post);
  }

  async correctLikeAndDislikeCountersUnban(postId: string, status: LikeType) {
    const post = await this.postsRepository.getPostById(postId.toString());
    if (status === 'Like') post.likesCount += 1;
    if (status === 'Dislike') post.dislikesCount += 1;
    await this.postsRepository.updatePost(post);
  }

  async getPostById(postId: string) {
    return this.postsRepository.getPostById(postId);
  }

  async banAndUnbanPostsByBlog(blogId: string, banStatus: boolean) {
    await this.postsRepository.banAndUnbanPostsByBlog(blogId, banStatus);
  }

  async checkUserForBan(userId: string, postId: string): Promise<boolean> {
    const post = await this.postsRepository.getPostById(postId);
    const blog = await this.blogsRepository.getBlogById(post.blogId);
    const userInBannedUsers = blog.bannedUsers.find((u) => u === userId);
    return !!userInBannedUsers;
  }
}
