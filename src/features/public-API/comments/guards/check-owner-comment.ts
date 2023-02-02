import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsQueryRepository } from '../api/comments.query.repository';

@Injectable()
export class CheckOwnerComment implements CanActivate {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // @ts-ignore
    const userId: string = request.user.id;

    const params = request.params;

    const comment = await this.commentsQueryRepository.getCommentById(
      params.commentId,
    );

    if (comment.commentatorInfo.userId !== userId)
      throw new HttpException('alien comment', HttpStatus.FORBIDDEN);
    return true;
  }
}
