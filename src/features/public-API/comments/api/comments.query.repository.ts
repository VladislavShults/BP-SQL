import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CommentDBType,
  ViewAllCommentsForAllPostsWithPaginationType,
  ViewCommentsTypeWithPagination,
  ViewCommentType,
} from '../types/comments.types';
import { mapComment } from '../helpers/mapCommentDBTypeToViewModel';
import { QueryPostDto } from '../../posts/api/models/query-post.dto';
import { LikeDBType } from '../../likes/types/likes.types';
import { mapCommentDBTypeToAllCommentForAllPosts } from '../helpers/mapCommentDBTypeToAllCommentForAllPosts';
import { QueryCommentDto } from './models/query-comment.dto';
import { BannedUsersForBlogDBType } from '../../blogs/types/blogs.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @Inject('COMMENT_MODEL')
    private readonly commentModel: Model<CommentDBType>,
    @Inject('LIKES_MODEL')
    private readonly likesModel: Model<LikeDBType>,
    @Inject('BANNED_USER_FOR_BLOG_MODEL')
    private readonly bannedUserForBlogModel: Model<BannedUsersForBlogDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<ViewCommentType | null> {
    let stringWhere = '';
    let params: string[] = [commentId];

    if (userId) {
      stringWhere =
        ', (SELECT "Status" as "myStatus" FROM public."CommentsLikesOrDislike" c WHERE "CommentId" = $1 AND "UserId" = $2) as "myStatus"';
      params = [commentId, userId];
    }

    let commentDBType = [];

    try {
      commentDBType = await this.dataSource.query(
        `
    SELECT c."CommentId" as "id", c."Content" as "content", c."UserId" as "userId", u."Login" as "userLogin", 
           c."CreatedAt" as "createdAt", 
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" c
        JOIN public."BanInfo" b
        ON c."UserId" = b."UserId"
        WHERE c."Status" = 'Like' AND c."CommentId" = $1 AND b."IsBanned" = false) as "likesCount",
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike"
        JOIN public."BanInfo" b
        ON c."UserId" = b."UserId"
        WHERE "Status" = 'Dislike' AND "CommentId" = $1 AND b."IsBanned" = false) as "dislikesCount"
        ${stringWhere}
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."CommentId" = $1`,
        params,
      );
    } catch (error) {}

    if (commentDBType.length === 0) return null;

    return mapComment(commentDBType[0]);
  }

  async getCommentsByPostId(
    postId: string,
    query: QueryPostDto,
    userId?: string,
  ): Promise<ViewCommentsTypeWithPagination> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    let stringWhere = '';
    let params: string[] = [postId];

    if (userId) {
      stringWhere =
        ', (SELECT "Status" as "myStatus" FROM public."CommentsLikesOrDislike" cl WHERE cl."CommentId" = c."CommentId" AND "UserId" = $2) as "myStatus"';
      params = [postId, userId];
    }

    let commentDBType = [];

    try {
      commentDBType = await this.dataSource.query(
        `
    SELECT c."CommentId" as "id", c."Content" as "content", c."UserId" as "userId", u."Login" as "userLogin", 
           c."CreatedAt" as "createdAt", 
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" cl
        WHERE "Status" = 'Like' AND cl."CommentId" = c."CommentId") as "likesCount",
        (SELECT COUNT(*)
        FROM public."CommentsLikesOrDislike" cl
        WHERE "Status" = 'Dislike' AND cl."CommentId" = c."CommentId") as "dislikesCount"
        ${stringWhere}
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."PostId" = $1
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
        params,
      );
    } catch (error) {}

    if (commentDBType.length === 0) return null;

    const items = commentDBType.map((i) => mapComment(i));

    const totalCount = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND c."PostId" = $1`,
      [params[0]],
    );

    return {
      pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }

  async getAllCommentsForAllPostsCurrentUser(
    query: QueryCommentDto,
    userId: string,
  ): Promise<ViewAllCommentsForAllPostsWithPaginationType> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const idsBannedUsersForBlogsThisUser: { id: number }[] =
      await this.dataSource.query(
        `
    SELECT bu."UserId" as "id"
    FROM public."BannedUsersForBlog" bu
    JOIN public."Blogs" b
    ON bu."BlogId" = b."BlogId"
    WHERE b."UserId" = $1`,
        [userId],
      );

    const bannedId = idsBannedUsersForBlogsThisUser.map((i) => {
      return i.id;
    });

    const itemsDBType = await this.dataSource.query(
      `
    SELECT c."CommentId" as "id", c."Content" as "content", c."UserId" as "userId", u."Login" as "userLogin",
           c."CreatedAt" as "createdAt", c."PostId" as "postId", p."Title" as "title", p."BlogId" as "blogId",
           b."BlogName" as "blogName"
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    JOIN public."Posts" p
    ON c."PostId" = p."PostId"
    JOIN public."Blogs" b
    ON p."BlogId" = b."BlogId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND b."UserId" = $1
    AND c."UserId" NOT IN (${bannedId})
    ORDER BY ${'"' + sortBy + '"'} ${sortDirection}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}`,
      [userId],
    );

    if (itemsDBType.length === 0) return null;

    const items = itemsDBType.map((i) =>
      mapCommentDBTypeToAllCommentForAllPosts(i),
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."Comments" c
    JOIN public."Users" u
    ON c."UserId" = u."UserId"
    JOIN public."Posts" p
    ON c."PostId" = p."PostId"
    JOIN public."Blogs" b
    ON p."BlogId" = b."BlogId"
    WHERE c."IsBanned" = false AND c."IsDeleted" = false AND b."UserId" = $1
    AND c."UserId" NOT IN (${bannedId})`,
      [userId],
    );

    return {
      pagesCount: Math.ceil(Number(totalCount[0].count) / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: Number(totalCount[0].count),
      items,
    };
  }
}
