import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { BlogsQueryRepository } from '../../../public-API/blogs/api/blogs.query.repository';

@Injectable()
export class CheckBlogInDBAndBlogOwnerGuard implements CanActivate {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;

    const userId = user.id.toString();

    const blog =
      await this.blogsQueryRepository.findBlogByIdReturnBlogWithUserId(
        request.params.blogId,
      );

    if (!blog) throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    if (userId !== blog.userId)
      throw new HttpException('User not owner', HttpStatus.FORBIDDEN);

    return true;
  }
}
