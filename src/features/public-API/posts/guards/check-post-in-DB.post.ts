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
import { PostDBType } from '../types/posts.types';

@Injectable()
export class CheckPostInDBGuard implements CanActivate {
  constructor(
    @Inject('POST_MODEL')
    private readonly postModel: Model<PostDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const params = request.params;
    if (params.postId.length !== 24)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    const post = await this.postModel.findById(params.postId);
    if (!post) throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
