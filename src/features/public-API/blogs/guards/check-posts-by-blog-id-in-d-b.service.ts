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
import { PostDBType } from '../../posts/types/posts.types';

@Injectable()
export class CheckPostsByBlogIdInDB implements CanActivate {
  constructor(
    @Inject('POST_MODEL')
    private readonly postModel: Model<PostDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const params = request.params;
    if (params.blogId.length !== 24)
      throw new HttpException('POSTS NOT FOUND', HttpStatus.NOT_FOUND);
    const post = await this.postModel.find({ blogId: params.blogId });
    if (post.length === 0)
      throw new HttpException('POSTS NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
