import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Model } from 'mongoose';
import { CommentDBType } from '../types/comments.types';

@Injectable()
export class CheckCommentInDB implements CanActivate {
  constructor(
    @Inject('COMMENT_MODEL')
    private readonly commentModel: Model<CommentDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const params = request.params;
    if (params.commentId.length !== 24)
      throw new HttpException('COMMENT NOT FOUND', HttpStatus.NOT_FOUND);
    const comment = await this.commentModel.findById(params.commentId);
    if (!comment)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
