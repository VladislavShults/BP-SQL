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

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogType>,
  ) {}

  async findBlogById(blogId: string): Promise<ViewBlogType | null> {
    if (blogId.length !== 24) return null;
    const blogDBType = await this.blogModel.findOne({
      _id: blogId,
      isBanned: false,
    });
    if (!blogDBType) return null;
    return mapBlogById(blogDBType);
  }

  async getBlogs(
    searchNameTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<ViewBlogsTypeWithPagination> {
    const itemsDBType: BlogDBTypeWithoutBlogOwner[] = await this.blogModel
      .find({
        isBanned: false,
        name: { $regex: searchNameTerm, $options: 'i' },
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort([[sortBy, sortDirection]])
      .lean();
    const items: ViewBlogType[] = itemsDBType.map((i) => mapBlog(i));

    const totalCount = await this.blogModel.count({
      isBanned: false,
      name: { $regex: searchNameTerm, $options: 'i' },
    });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
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
