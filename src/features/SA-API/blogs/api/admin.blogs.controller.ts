import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public-API/auth/guards/basic-auth.guard';
import { URIParamBindUserToBlog } from './models/URI-paramBindUserToBlog';
import { UsersService } from '../../users/application/users.servive';
import { createErrorMessage } from '../../../public-API/auth/helpers/create-error-message';
import { BlogsService } from '../../../public-API/blogs/application/blogs.service';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { AdminBlogsQueryRepository } from './admin.blogs.query.repository';
import { URIParamBlogDto } from '../../../public-API/blogs/api/models/URIParam-blog.dto';
import { BanBlogDto } from './models/ban-blog.dto';

@Controller('sa/blogs')
export class AdminBlogsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly adminBlogQueryRepository: AdminBlogsQueryRepository,
  ) {}

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async bindUserToBlog(@Param() params: URIParamBindUserToBlog) {
    const user = await this.usersService.findUserById(params.userId);
    if (!user) throw new BadRequestException(createErrorMessage('userId'));

    const blog = await this.blogsService.findBlogById(params.blogId);
    if (!blog || blog.blogOwnerInfo.userId)
      throw new BadRequestException(createErrorMessage('blogId'));

    await this.blogsService.bindUserToBlog(blog, user);
    return;
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(@Query() query: QueryBlogDto) {
    return await this.adminBlogQueryRepository.getBlogs(query);
  }

  @Put(':blogId/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banAndUnbanBlog(
    @Param() params: URIParamBlogDto,
    @Body() inputModel: BanBlogDto,
  ) {
    const blog = await this.blogsService.findBlogById(params.blogId);
    if (!blog) throw new HttpException('blog not found', HttpStatus.NOT_FOUND);

    await this.blogsService.banAndUnbanBlog(params.blogId, inputModel.isBanned);
    return;
  }
}
