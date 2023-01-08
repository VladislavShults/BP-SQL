import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Request } from 'express';
import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class CheckBlogInDBAndBlogOwnerGuard implements CanActivate {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;
    const userId = user._id.toString();

    if (request.params.blogId.length !== 24)
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    const blog = await this.blogModel.findById(request.params.blogId);
    if (!blog) throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    if (userId !== blog.blogOwnerInfo.userId)
      throw new HttpException('User not owner', HttpStatus.FORBIDDEN);

    return true;
  }
}
