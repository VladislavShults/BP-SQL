import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CheckPostInDBGuard implements CanActivate {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const params = request.params;

    const postArray = await this.dataSource.query(
      `
    SELECT "PostId", "IsDeleted"
    FROM public."Posts"
    WHERE "PostId" = $1 AND "BlogId" = $2 AND "IsDeleted" = false`,
      [params.postId, params.blogId],
    );

    if (postArray.length === 0)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);
    return true;
  }
}
