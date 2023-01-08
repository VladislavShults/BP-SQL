import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments.query.repository';
import { URIParamCommentDto } from './models/URIParam-comment.dto';
import { ViewCommentType } from '../types/comments.types';
import { UpdateCommentDto } from './models/update-comment.dto';
import { LikeStatusCommentDto } from './models/like-status.comment.dto';
import { JwtAuthGuard } from '../../auth/guards/JWT-auth.guard';
import { CheckCommentInDB } from '../guards/check-comment-in-DB';
import { GetUserFromToken } from '../../auth/guards/getUserFromToken.guard';
import { CheckOwnerComment } from '../guards/check-owner-comment';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':commentId')
  @UseGuards(GetUserFromToken)
  async getCommentById(
    @Param() params: URIParamCommentDto,
    @Request() req,
  ): Promise<ViewCommentType> {
    const userId = req.user?._id;

    const comment = await this.commentsQueryRepository.getCommentById(
      params.commentId,
      userId,
    );
    if (!comment)
      throw new HttpException('COMMENT NOT FOUND', HttpStatus.NOT_FOUND);
    return comment;
  }

  @Delete(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckCommentInDB, CheckOwnerComment)
  async deleteCommentById(
    @Param() params: URIParamCommentDto,
  ): Promise<HttpStatus> {
    await this.commentsService.deleteCommentById(params.commentId);
    return;
  }

  @Put(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckCommentInDB, CheckOwnerComment)
  async updateCommentById(
    @Param() params: URIParamCommentDto,
    @Body() updateCommentDTO: UpdateCommentDto,
  ): Promise<HttpStatus> {
    await this.commentsService.updateComment(
      params.commentId,
      updateCommentDTO.content,
    );
    return;
  }

  @Put(':commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CheckCommentInDB)
  async makeLikeOrUnlike(
    @Param() params: URIParamCommentDto,
    @Body() inputModel: LikeStatusCommentDto,
    @Request() req,
  ) {
    const user = req.user;

    await this.commentsService.makeLikeOrUnlike(
      params.commentId,
      user,
      inputModel.likeStatus,
    );

    return;
  }
}
