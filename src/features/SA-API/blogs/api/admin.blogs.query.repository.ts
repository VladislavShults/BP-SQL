import { Inject, Injectable } from '@nestjs/common';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { Model } from 'mongoose';
import { BlogDBType } from '../../../public-API/blogs/types/blogs.types';
import {
  ViewBlogsTypeWithUserOwnerPagination,
  ViewBlogWithUserOwnerType,
} from '../types/admin.blogs.types';
import { mapBlogUserOwner } from '../helpers/mapBlogUserOwner';

@Injectable()
export class AdminBlogsQueryRepository {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
  ) {}

  async getBlogs(
    query: QueryBlogDto,
  ): Promise<ViewBlogsTypeWithUserOwnerPagination> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const itemsDBType: BlogDBType[] = await this.blogModel
      .find({
        // isBanned: false,
        name: { $regex: searchNameTerm, $options: 'i' },
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort([[sortBy, sortDirection]])
      .lean();

    const items: ViewBlogWithUserOwnerType[] = itemsDBType.map((i) =>
      mapBlogUserOwner(i),
    );

    const totalCount = await this.blogModel.count({
      // isBanned: false,
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
}
