import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  BlogDBType,
  BlogDBTypeWithoutBlogOwner,
  ViewBlogsTypeWithPagination,
  ViewBlogType,
} from '../../../public-API/blogs/types/blogs.types';
import { mapBlogById } from '../../../public-API/blogs/helpers/mapBlogByIdToViewModel';
import { QueryBlogDto } from '../../../public-API/blogs/api/models/query-blog.dto';
import { mapBlog } from '../../../public-API/blogs/helpers/mapBlogDBToViewModel';

@Injectable()
export class BloggersBlogsQueryRepository {
  constructor(
    @Inject('BLOG_MODEL')
    private readonly blogModel: Model<BlogDBType>,
  ) {}

  async findBlogById(blogId: string): Promise<ViewBlogType | null> {
    if (blogId.length !== 24) return null;
    const blogDBType = await this.blogModel.findById(blogId);
    if (!blogDBType) return null;
    return mapBlogById(blogDBType);
  }

  async getBlogs(
    query: QueryBlogDto,
    userId: string,
  ): Promise<ViewBlogsTypeWithPagination> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const itemsDBType: BlogDBTypeWithoutBlogOwner[] = await this.blogModel
      .find({
        'blogOwnerInfo.userId': userId,
        name: { $regex: searchNameTerm, $options: 'i' },
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort([[sortBy, sortDirection]])
      .lean();

    const items: ViewBlogType[] = itemsDBType.map((i) => mapBlog(i));

    return {
      pagesCount: Math.ceil(
        (await this.blogModel.count({
          'blogOwnerInfo.userId': userId,
          name: { $regex: searchNameTerm, $options: 'i' },
        })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.blogModel.count({
        'blogOwnerInfo.userId': userId,
        name: { $regex: searchNameTerm, $options: 'i' },
      }),
      items,
    };
  }
}
