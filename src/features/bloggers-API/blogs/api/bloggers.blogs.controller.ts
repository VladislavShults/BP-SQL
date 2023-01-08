import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { URIParamBlogDto } from '../../../public-API/blogs/api/models/URIParam-blog.dto';
import { JwtAuthGuard } from '../../../public-API/auth/guards/JWT-auth.guard';
import { CheckBlogInDBAndBlogOwnerGuard } from '../guards/chechBlogOwner.guard';
import { UpdateBlogDto } from '../../../public-API/blogs/api/models/update-blog.dto';
import { CreateBlogDto } from '../../../public-API/blogs/api/models/create-blog.dto';
import { ViewBlogType } from '../../../public-API/blogs/types/blogs.types';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { BloggersBlogsQueryRepository } from './bloggers.blogs.query.repository';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { CreatePostBySpecificBlogDto } from '../../../public-API/blogs/api/models/create-postBySpecificBlog.dto';
import { ViewPostType } from '../../../public-API/posts/types/posts.types';
import { PostsService } from '../../../public-API/posts/application/posts.service';
import { PostsQueryRepository } from '../../../public-API/posts/api/posts.query.repository';
import { URIParamsUpdateDto } from './models/URI-params-update.dto';
import { UpdatePostByBlogIdDto } from './models/update-postByBlogId.dto';
import { CheckPostInDBGuard } from '../../../public-API/posts/guards/check-post-in-DB.post';
import { URIParamsDeleteDto } from './models/URI-params-delete.dto';
import { BlogsService } from '../../../public-API/blogs/application/blogs.service';
import { CommentsQueryRepository } from '../../../public-API/comments/api/comments.query.repository';
import { ViewAllCommentsForAllPostsWithPaginationType } from '../../../public-API/comments/types/comments.types';
import { QueryCommentDto } from '../../../public-API/comments/api/models/query-comment.dto';

@Controller('blogger/blogs')
export class BloggersBlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BloggersBlogsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Delete(':blogId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async deleteBlogById(@Param() params: URIParamBlogDto): Promise<HttpStatus> {
    await this.blogsService.deleteBlogById(params.blogId);
    return;
  }

  @Put(':blogId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async updateBlog(
    @Param() params: URIParamBlogDto,
    @Body() updateBlogDTO: UpdateBlogDto,
  ): Promise<HttpStatus> {
    await this.blogsService.updateBlogById(params.blogId, updateBlogDTO);
    return;
  }

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() createBlogDTO: CreateBlogDto,
    @Request() req,
  ): Promise<ViewBlogType> {
    const user: UserDBType = req.user;

    const newBlogObjectId = await this.blogsService.createBlog(
      createBlogDTO,
      user,
    );
    return await this.blogsQueryRepository.findBlogById(newBlogObjectId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBlogs(@Query() query: QueryBlogDto, @Request() req) {
    const userId: string = req.user._id.toString();
    return await this.blogsQueryRepository.getBlogs(query, userId);
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard)
  async createPostForSpecificBlog(
    @Param() params: URIParamBlogDto,
    @Body() inputModel: CreatePostBySpecificBlogDto,
  ): Promise<ViewPostType> {
    const createPostDTO = this.blogsService.createPostDTO(
      params.blogId,
      inputModel,
    );

    const blog = await this.blogsService.findBlogById(params.blogId);

    const postObjectId = await this.postsService.createPost(
      createPostDTO,
      blog.blogOwnerInfo.userId,
    );

    return await this.postsQueryRepository.getPostById(postObjectId.toString());
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard, CheckPostInDBGuard)
  async updatePost(
    @Param() params: URIParamsUpdateDto,
    @Body() inputModel: UpdatePostByBlogIdDto,
  ): Promise<HttpStatus> {
    const updateModel = this.postsService.createUpdateModel(params, inputModel);
    await this.postsService.updatePost(params.postId, updateModel);
    return;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckBlogInDBAndBlogOwnerGuard, CheckPostInDBGuard)
  async deletePostById(
    @Param() params: URIParamsDeleteDto,
  ): Promise<HttpStatus> {
    const result = await this.postsService.deletePostByIdForBlogId(
      params.postId,
      params.blogId,
    );
    if (!result)
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    return;
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForAllPostsCurrentUser(
    @Query() query: QueryCommentDto,
    @Request() req,
  ): Promise<ViewAllCommentsForAllPostsWithPaginationType> {
    const userId: string = req.user._id.toString();
    return await this.commentsQueryRepository.getAllCommentsForAllPostsCurrentUser(
      query,
      userId,
    );
  }
}
