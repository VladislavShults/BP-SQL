import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../../public-API/blogs/application/blogs.service';
import { URIParamUserDto } from '../../../SA-API/users/api/models/URIParam-user.dto';
import { JwtAuthGuard } from '../../../public-API/auth/guards/JWT-auth.guard';
import { BanUserForBlogDto } from './models/ban-user-for-blog.dto';
import { URIParamBlogDto } from '../../../public-API/blogs/api/models/URIParam-blog.dto';
import { BlogsQueryRepository } from '../../../public-API/blogs/api/blogs.query.repository';
import { ViewBannedUsersForBlogWithPaginationType } from '../../../public-API/blogs/types/blogs.types';
import { UsersService } from '../../../SA-API/users/application/users.servive';
import { QueryBannedUsersDto } from './models/query-banned-users.dto';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @Put(':userId/ban')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async banAndUnbanUser(
    @Param() params: URIParamUserDto,
    @Body() inputModel: BanUserForBlogDto,
    @Request() req,
  ): Promise<HttpStatus> {
    const user = await this.usersService.findUserById(params.userId);
    if (!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    const blog = await this.blogsService.findBlogById(inputModel.blogId);
    if (!blog) throw new HttpException('blog not found', HttpStatus.NOT_FOUND);

    if (blog.blogOwnerInfo.userId !== req.user._id.toString())
      throw new HttpException('created by another user', HttpStatus.FORBIDDEN);

    await this.blogsService.banAndUnbanUserByBlog(params.userId, inputModel);
    return;
  }

  @Get('blog/:blogId')
  @UseGuards(JwtAuthGuard)
  async getAllPostsByBlogId(
    @Param() params: URIParamBlogDto,
    @Query() query: QueryBannedUsersDto,
    @Request() req,
  ): Promise<ViewBannedUsersForBlogWithPaginationType> {
    const blog = await this.blogsService.findBlogById(params.blogId);
    if (!blog) throw new HttpException('blog not found', HttpStatus.NOT_FOUND);

    if (blog.blogOwnerInfo.userId !== req.user._id.toString())
      throw new HttpException('user not owner blog', HttpStatus.FORBIDDEN);

    return await this.blogsQueryRepository.getAllBannedUserForBlog(
      params.blogId,
      query,
    );
  }
}
