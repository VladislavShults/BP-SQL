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
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { ViewPostWithoutLikesType } from '../types/posts.types';
import { PostsService } from '../application/posts.service';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsQueryRepository } from './posts.query.repository';
import { URIParamPostDto } from './models/URIParam-post.dto';
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
import { CreateCommentDto } from '../../comments/api/models/create-comment.dto';
import { LikesService } from '../../likes/application/likes.service';
import { UserIsBannedGuard } from '../../../SA-API/users/guards/UserIsBannedGuard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId')
  @UseGuards(GetUserFromToken, CheckPostInDBGuard)
  async getPostById(
    @Param() params: URIParamPostDto,
    @Request() req,
  ): Promise<ViewPostWithoutLikesType> {
    const userId = req.user?.id;
    return this.postsQueryRepository.getPostById(params.postId, userId);
  }

  @Get()
  @UseGuards(GetUserFromToken)
  async getPosts(@Query() query: QueryPostDto, @Request() req) {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const userId = req.user?.id.toString() || null;

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
  @UseGuards(JwtAuthGuard, UserIsBannedGuard, CheckPostInDBGuard)
  async createCommentByPost(
    @Param() params: URIParamPostDto,
    @Body() inputModel: CreateCommentDto,
    @Request() req,
  ): Promise<ViewCommentType> {
    const user = req.user;

    const userIsBannedForBlog = await this.postsService.checkUserForBanByBlog(
      user.id,
      params.postId,
    );
    if (userIsBannedForBlog)
      throw new HttpException('user', HttpStatus.FORBIDDEN);

    const createCommentAndReturnId =
      await this.commentsService.createCommentByPost(
        params.postId,
        inputModel,
        user.id,
      );

    return await this.commentsQueryRepository.getCommentById(
      createCommentAndReturnId.toString(),
      user.id,
    );
  }

  @Get(':postId/comments')
  @UseGuards(GetUserFromToken)
  async getCommentsByPostId(
    @Param() params: URIParamPostDto,
    @Query() query: QueryPostDto,
    @Request() req,
  ): Promise<ViewCommentsTypeWithPagination> {
    const userId = req.user?.id.toString() || null;
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
  @UseGuards(JwtAuthGuard, UserIsBannedGuard, CheckPostInDBGuard)
  async makeLikeOrUnlike(
    @Param() params: URIParamPostDto,
    @Body() inputModel: LikeStatusPostDto,
    @Request() req,
  ) {
    const userId = req.user.id;

    await this.likesService.makeLikeOrDislikeForPosts(
      params.postId,
      userId,
      inputModel.likeStatus,
    );

    await this.likesService.updateNewestLikesForPost(params.postId);

    return;
  }
}
