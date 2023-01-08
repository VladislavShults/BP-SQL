import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../api/models/update-blog.dto';
import { CreateBlogDto } from '../api/models/create-blog.dto';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { BannedUsersForBlogType, BlogDBType } from '../types/blogs.types';
import { CreatePostBySpecificBlogDto } from '../api/models/create-postBySpecificBlog.dto';
import { CreatePostDto } from '../../posts/api/models/create-post.dto';
import { BanUserForBlogDto } from '../../../bloggers-API/users/api/models/ban-user-for-blog.dto';
import { UsersService } from '../../../SA-API/users/application/users.servive';
import { PostsService } from '../../posts/application/posts.service';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async deleteBlogById(blogId: string) {
    return this.blogsRepository.deleteBlogById(blogId);
  }

  async updateBlogById(blogId: string, updateBlogDTO: UpdateBlogDto) {
    const blog = await this.blogsRepository.getBlogById(blogId);
    blog.name = updateBlogDTO.name;
    blog.websiteUrl = updateBlogDTO.websiteUrl;
    blog.description = updateBlogDTO.description;
    await this.blogsRepository.updateBlog(blog);
  }

  async createBlog(
    createBlogDTO: CreateBlogDto,
    user: UserDBType,
  ): Promise<string> {
    const newBlog: Omit<BlogDBType, '_id'> = {
      name: createBlogDTO.name,
      description: createBlogDTO.description,
      websiteUrl: createBlogDTO.websiteUrl,
      createdAt: new Date(),
      blogOwnerInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
      isBanned: false,
      banDate: null,
      bannedUsers: [],
    };
    return this.blogsRepository.createBlog(newBlog);
  }

  createPostDTO(
    blogId: string,
    inputModel: CreatePostBySpecificBlogDto,
  ): CreatePostDto {
    return {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: blogId,
    };
  }

  async findBlogById(blogId: string) {
    return this.blogsRepository.getBlogById(blogId);
  }

  async bindUserToBlog(blog: BlogDBType, user: UserDBType) {
    blog.blogOwnerInfo.userId = user._id.toString();
    blog.blogOwnerInfo.userLogin = user.login;
    await this.blogsRepository.updateBlog(blog);
  }

  async banAndUnbanUserByBlog(userId: string, inputModel: BanUserForBlogDto) {
    const blog = await this.blogsRepository.getBlogById(inputModel.blogId);

    const user = await this.usersService.findUserById(userId);

    const userIdIsBanned = blog.bannedUsers.find((u) => u === userId);

    if (!!inputModel.isBanned && !userIdIsBanned) {
      blog.bannedUsers.push(userId);
      await this.blogsRepository.updateBlog(blog);

      const bannedUser: BannedUsersForBlogType = {
        id: userId,
        login: user.login,
        banInfo: {
          isBanned: inputModel.isBanned,
          banDate: new Date(),
          banReason: inputModel.banReason,
        },
        blogId: blog._id.toString(),
      };

      await this.blogsRepository.saveBannedUserForBlog(bannedUser);

      return;
    }

    if (!inputModel.isBanned && userIdIsBanned) {
      await this.blogsRepository.deleteUserIdFromBannedUsersInBlog(
        blog._id.toString(),
        userIdIsBanned,
      );

      await this.blogsRepository.removeUserIdFromBannedUsersInBannedModel(
        userId,
        blog._id.toString(),
      );

      return;
    }
  }

  async banAndUnbanBlog(blogId: string, banStatus: boolean) {
    const blog = await this.blogsRepository.getBlogById(blogId);

    if (blog.isBanned === banStatus) return;

    if (banStatus === true) {
      blog.isBanned = banStatus;
      blog.banDate = new Date();
      await this.blogsRepository.updateBlog(blog);
    } else {
      blog.isBanned = banStatus;
      blog.banDate = null;
      await this.blogsRepository.updateBlog(blog);
    }

    await this.postsService.banAndUnbanPostsByBlog(blogId, banStatus);
    return;
  }
}
