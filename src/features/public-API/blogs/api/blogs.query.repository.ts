import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  BannedUsersForBlogDBType,
  BannedUsersForBlogViewType,
  BlogDBType,
  BlogDBTypeWithoutBlogOwner,
  ViewBannedUsersForBlogWithPaginationType,
  ViewBlogsTypeWithPagination,
  ViewBlogType,
} from '../types/blogs.types';
import { mapBlog } from '../helpers/mapBlogDBToViewModel';
import {
  mapBlogById,
  mapBlogByIdWithUserId,
} from '../helpers/mapBlogByIdToViewModel';
import { QueryBannedUsersDto } from '../../../bloggers-API/users/api/models/query-banned-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findBlogById(blogId: string): Promise<ViewBlogType | null> {
    const blogDBType = await this.getBlogByIdDBType(blogId);
    if (!blogDBType) return null;
    return mapBlogById(blogDBType);
  }

  async findBlogByIdWithUserId(blogId: string) {
    const blogDBType = await this.getBlogByIdDBType(blogId);
    if (!blogDBType) return null;
    return mapBlogByIdWithUserId(blogDBType);
  }

  async getBlogs(
    searchNameTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    userId?: string,
  ): Promise<ViewBlogsTypeWithPagination> {
    const itemsDB: BlogDBTypeWithoutBlogOwner[] = await this.dataSource.query(
      `
    SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description", "WebsiteUrl" as "websiteUrl",
            b."CreatedAt" as "createdAt"
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    WHERE bi."IsBanned" = false AND u."IsDeleted" = false AND LOWER ("BlogName") LIKE $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
      ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
    );

    const items = itemsDB.map((i) => mapBlog(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."Blogs" b
    JOIN public. "Users" u
    ON b."UserId" = u."UserId"
    JOIN public. "BanInfo" bi
    ON b."UserId" = bi."UserId"
    WHERE bi."IsBanned" = false AND u."IsDeleted" = false AND LOWER ("BlogName") LIKE $1`,
      ['%' + searchNameTerm.toLocaleLowerCase() + '%'],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount[0].count,
      items,
    };
  }

  async getLoginBloggerByBlogId(blogId: string): Promise<string> {
    const blog = await this.blogModel.findById(blogId);
    return blog.name;
  }

  async getAllBannedUserForBlog(
    blogId: string,
    query: QueryBannedUsersDto,
  ): Promise<ViewBannedUsersForBlogWithPaginationType> {
    const searchLoginTerm: string = query.searchLoginTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'banDate';
    const sortDirection = query.sortDirection || 'desc';

    let bannedUsersDBType: BannedUsersForBlogDBType[] = [];
    let totalCountArr = [];

    try {
      bannedUsersDBType = await this.dataSource.query(
        `
      SELECT b."UserId" as "userId", u."Login" as "login", "IsBanned" as "isBanned", "BanDate" as "banDate",
            "BanReason" as "banReason", "BlogId" as "blogId"
      FROM public."BannedUsersForBlog" b
      JOIN public."Users" u
      ON b."UserId" = u."UserId"
      WHERE b."BlogId" = $1 AND LOWER ("Login") LIKE '%%'
      ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};`,
        [
          blogId,
          // '%' + searchLoginTerm.toLocaleLowerCase() + '%'
        ],
      );
    } catch (error) {
      bannedUsersDBType = [];
    }

    const items: BannedUsersForBlogViewType[] = bannedUsersDBType.map((b) => ({
      id: b.userId.toString(),
      login: b.login,
      banInfo: {
        isBanned: b.isBanned,
        banDate: b.banDate,
        banReason: b.banReason,
      },
    }));

    try {
      totalCountArr = await this.dataSource.query(
        `
    SELECT count(*)
      FROM public."BannedUsersForBlog" b
      JOIN public."Users" u
      ON b."UserId" = u."UserId"
      WHERE b."BlogId" = $1 AND LOWER ("Login") LIKE $2`,
        [blogId, '%' + searchLoginTerm.toLocaleLowerCase() + '%'],
      );
    } catch (error) {
      totalCountArr[0].count = 0;
    }

    return {
      pagesCount: Math.ceil(totalCountArr[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCountArr[0].count),
      items,
    };
  }

  private async getBlogByIdDBType(blogId: string) {
    try {
      const array = await this.dataSource.query(
        `
    SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description",
            "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt", "UserId" as "userId"
    FROM public."Blogs"
    WHERE "BlogId" = $1 AND "IsDeleted" = false;`,
        [blogId],
      );

      if (array.length === 0) return null;
      else return array[0];
    } catch (error) {
      return null;
    }
  }
}
