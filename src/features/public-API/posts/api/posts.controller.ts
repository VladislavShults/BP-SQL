import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ViewPostWithoutLikesType } from '../types/posts.types';
import { PostsService } from '../application/posts.service';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsQueryRepository } from './posts.query.repository';
import { URIParamPostDto } from './models/URIParam-post.dto';
import { CreateCommentDto } from '../../comments/api/models/create-comment.dto';
import {
  ViewCommentsTypeWithPagination,
  ViewCommentType,
} from '../../comments/types/comments.types';
import { CommentsService } from '../../comments/application/comments.service';
import { CommentsQueryRepository } from '../../comments/api/comments.query.repository';
import { QueryPostDto } from './models/query-post.dto';
import { LikeStatusPostDto } from './models/like-status.post.dto';
import { JwtAuthGuard } from '../../auth/guards/JWT-auth.guard';
import { CheckPostInDBGuard } from '../guards/check-post-in-DB.post';
import { GetUserFromToken } from '../../auth/guards/getUserFromToken.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId')
  @UseGuards(GetUserFromToken)
  async getPostById(
    @Param() params: URIParamPostDto,
    @Request() req,
  ): Promise<ViewPostWithoutLikesType> {
    const userId = req.user?._id;
    const post = await this.postsQueryRepository.getPostById(
      params.postId,
      userId,
    );
    if (!post) throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    else return post;
  }

  @Get()
  @UseGuards(GetUserFromToken)
  async getPosts(@Query() query: QueryPostDto, @Request() req) {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const userId = req.user?._id.toString() || null;

    return await this.postsQueryRepository.getPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      userId,
    );
  }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, CheckPostInDBGuard)
  async createCommentByPost(
    @Param() params: URIParamPostDto,
    @Body() inputModel: CreateCommentDto,
    @Request() req,
  ): Promise<ViewCommentType> {
    const user = req.user;

    const userBannedForBlog = await this.postsService.checkUserForBan(
      user._id.toString(),
      params.postId,
    );
    if (userBannedForBlog)
      throw new HttpException('user', HttpStatus.FORBIDDEN);

    const commentObjectId = await this.commentsService.createCommentByPost(
      params.postId,
      inputModel,
      user,
    );
    return await this.commentsQueryRepository.getCommentById(
      commentObjectId.toString(),
    );
  }

  @Get(':postId/comments')
  @UseGuards(GetUserFromToken)
  async getCommentsByPostId(
    @Param() params: URIParamPostDto,
    @Query() query: QueryPostDto,
    @Request() req,
  ): Promise<ViewCommentsTypeWithPagination> {
    const userId = req.user?._id.toString() || null;
    const comments = await this.commentsQueryRepository.getCommentsByPostId(
      params.postId,
      query,
      userId,
    );
    if (!comments)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return comments;
  }
  @Put(':postId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckPostInDBGuard)
  async makeLikeOrUnlike(
    @Param() params: URIParamPostDto,
    @Body() inputModel: LikeStatusPostDto,
    @Request() req,
  ) {
    const user = req.user;
    await this.postsService.makeLikeOrUnlike(
      params.postId,
      user,
      inputModel.likeStatus,
    );
    return;
  }
}
