import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../api/models/update-blog.dto';
import { CreateBlogDto } from '../api/models/create-blog.dto';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { BanUserForBlogDto } from '../../../bloggers-API/users/api/models/ban-user-for-blog.dto';
import { BlogsQueryRepository } from '../api/blogs.query.repository';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository, // private readonly usersService: UsersService, // private readonly postsService: PostsService,
  ) {}

  async deleteBlogById(blogId: string) {
    return this.blogsRepository.deleteBlogById(blogId);
  }

  async updateBlogById(blogId: string, updateBlogDTO: UpdateBlogDto) {
    await this.blogsRepository.updateBlog(blogId, updateBlogDTO);
  }

  async createBlog(
    createBlogDTO: CreateBlogDto,
    user: UserDBType,
  ): Promise<string> {
    return this.blogsRepository.createBlog(createBlogDTO, user);
  }

  // async bindUserToBlog(blog: BlogDBType, user: UserDBType) {
  //   blog.blogOwnerInfo.userId = user.id.toString();
  //   blog.blogOwnerInfo.userLogin = user.login;
  //   await this.blogsRepository.updateBlog(blog);
  // }

  async banAndUnbanUserByBlog(userId: string, inputModel: BanUserForBlogDto) {
    const userInBanListForBlog =
      await this.blogsRepository.checkUserInBanListForBlog(
        userId,
        inputModel.blogId,
      );

    if (inputModel.isBanned && !userInBanListForBlog) {
      await this.blogsRepository.addUserToBanList(userId, inputModel);
      return;
    }

    if (!inputModel.isBanned && userInBanListForBlog) {
      await this.blogsRepository.removeUserIdFromBannedListBlogs(
        userId,
        inputModel.blogId,
      );
      return;
    }
  }

  // async banAndUnbanBlog(blogId: string, banStatus: boolean) {
  //   const blog = await this.blogsRepository.getBlogById(blogId);
  //
  //   if (blog.isBanned === banStatus) return;
  //
  //   if (banStatus === true) {
  //     blog.isBanned = banStatus;
  //     blog.banDate = new Date();
  //     await this.blogsRepository.updateBlog(blog);
  //   } else {
  //     blog.isBanned = banStatus;
  //     blog.banDate = null;
  //     await this.blogsRepository.updateBlog(blog);
  //   }
  //
  //   await this.postsService.banAndUnbanPostsByBlog(blogId, banStatus);
  //   return;
  // }
}
