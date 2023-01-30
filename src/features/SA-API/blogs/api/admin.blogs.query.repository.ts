import { Injectable } from '@nestjs/common';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import { ViewBlogsTypeWithUserOwnerPagination } from '../types/admin.blogs.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mapBlogUserOwner } from '../helpers/mapBlogUserOwner';

@Injectable()
export class AdminBlogsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getBlogs(
    query: QueryBlogDto,
  ): Promise<ViewBlogsTypeWithUserOwnerPagination> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'desc';

    const itemsDB: [BlogDBType & { login: string }] =
      await this.dataSource.query(
        `
    SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
            b."CreatedAt" as "createdAt"
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    WHERE b."IsDeleted" = false AND LOWER ("BlogName") LIKE $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
        ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
      );

    const items = itemsDB.map((i) => mapBlogUserOwner(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    WHERE b."IsDeleted" = false AND LOWER ("BlogName") LIKE $1`,
      ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }
}
