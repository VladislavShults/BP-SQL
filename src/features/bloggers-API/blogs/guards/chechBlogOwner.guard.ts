import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CheckBlogInDBAndBlogOwnerGuard implements CanActivate {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: UserDBType = request.user as UserDBType;
    const userId = user.id.toString();

    const blogArray = await this.dataSource.query(
      `
    SELECT "BlogId", "BlogName", "Description", "WebsiteUrl", "CreatedAt", "UserId" as "userId", "IsDeleted"
    FROM public."Blogs"
    WHERE "BlogId" = $1 AND "IsDeleted" = false`,
      [request.params.blogId],
    );
    if (blogArray.length === 0)
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    if (Number(userId) !== blogArray[0].userId)
      throw new HttpException('User not owner', HttpStatus.FORBIDDEN);

    return true;
  }
}
