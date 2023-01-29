import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  BannedUsersForBlogType,
  BlogDBType,
  BlogDBTypeWithoutBlogOwner,
  ViewBannedUsersForBlogWithPaginationType,
  ViewBlogsTypeWithPagination,
  ViewBlogType,
} from '../types/blogs.types';
import { mapBlog } from '../helpers/mapBlogDBToViewModel';
import { mapBlogById } from '../helpers/mapBlogByIdToViewModel';
import { QueryBannedUsersDto } from '../../../bloggers-API/users/api/models/query-banned-users.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findBlogById(blogId: string): Promise<ViewBlogType | null> {
    const blogDBType = await this.dataSource.query(
      `
    SELECT "BlogId" as "id", "BlogName" as "name", "Description" as "description",
            "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt"
    FROM public."Blogs"
    WHERE "BlogId" = $1;`,
      [blogId],
    );
    if (!blogDBType) return null;
    return mapBlogById(blogDBType[0]);
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
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const bannedUsersDBType: BannedUsersForBlogType[] =
      await this.bannedUserForBlogModel
        .find({
          blogId: blogId,
          login: { $regex: searchLoginTerm, $options: 'i' },
        })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort([[sortBy, sortDirection]])
        .lean();

    const items: Omit<BannedUsersForBlogType, 'blogId'>[] =
      bannedUsersDBType.map((b) => ({
        id: b.id,
        login: b.login,
        banInfo: {
          isBanned: b.banInfo.isBanned,
          banDate: b.banInfo.banDate,
          banReason: b.banInfo.banReason,
        },
      }));

    const totalCount = await this.bannedUserForBlogModel.count({
      blogId: blogId,
      login: { $regex: searchLoginTerm, $options: 'i' },
    });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items,
    };
  }
}
