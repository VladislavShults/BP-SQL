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
export class CheckCommentInDB implements CanActivate {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const params = request.params;

    let commentArray: any[];

    try {
      commentArray = await this.dataSource.query(
        `
    SELECT "CommentId", "IsDeleted"
    FROM public."Comments" c
    JOIN public."BanInfo" b
    ON b."UserId" = c."UserId"
    WHERE c."CommentId" = $1 AND c."IsDeleted" = false AND c."IsBanned" = false AND b."IsBanned" = false`,
        [params.commentId],
      );
    } catch (error) {
      commentArray = [];
    }

    if (commentArray.length === 0)
      throw new HttpException('POST NOT FOUND', HttpStatus.NOT_FOUND);

    return true;
  }
}
