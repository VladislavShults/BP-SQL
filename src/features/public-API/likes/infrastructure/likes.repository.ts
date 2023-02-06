import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  BannedLikesOrDislikes,
  LikeDBType,
  LikeType,
} from '../types/likes.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewestLikesType } from '../../posts/types/posts.types';

@Injectable()
export class LikesRepository {
  constructor(
    @Inject('LIKES_MODEL')
    private readonly likesModel: Model<LikeDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findLikeByUserIdAndPostId(userId: string, postId: string) {
    const like = await this.likesModel.findOne({
      idObject: postId,
      userId: userId,
      postOrComment: 'post',
      isBanned: false,
    });
    if (!like) return null;
    return like;
  }

  async saveLikeOrUnlike(likeOrUnlike: Omit<LikeDBType, '_id'>) {
    await this.likesModel.create(likeOrUnlike);
  }

  async updateLike(likeInDb) {
    await likeInDb.save();
  }

  async findLikeByUserIdAndCommentId(userId: string, commentId: string) {
    const like = await this.likesModel.findOne({
      idObject: commentId,
      userId: userId,
      postOrComment: 'comment',
      isBanned: false,
    });
    if (!like) return null;
    return like;
  }

  async banLikes(userId: string) {
    await this.likesModel.updateMany(
      { userId: userId },
      { $set: { isBanned: true } },
    );
  }

  async unbanLikes(userId: string) {
    await this.likesModel.updateMany(
      { userId: userId },
      { $set: { isBanned: false } },
    );
  }

  async getBannedLikesForPostsByUser(
    userId: string,
  ): Promise<BannedLikesOrDislikes[]> {
    return this.likesModel
      .find(
        {
          userId: userId,
          postOrComment: 'post',
          isBanned: true,
        },
        { status: 1, idObject: 1 },
      )
      .lean();
  }

  async getBannedLikesForCommentsByUser(
    userId: string,
  ): Promise<BannedLikesOrDislikes[]> {
    return this.likesModel
      .find(
        {
          userId: userId,
          postOrComment: 'comment',
          isBanned: true,
        },
        { status: 1, idObject: 1 },
      )
      .lean();
  }

  async saveLikeOrUnlikeForPost(
    postId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.dataSource.query(
        `
    INSERT INTO public."PostsLikesOrDislike"(
        "UserId", "PostId", "Status", "CreatedAt")
    VALUES ($1, $2, $3, $4);`,
        [userId, postId, likeStatus, new Date()],
      );
    } catch (error) {
      return null;
    }
  }

  async changeLikeStatusForPost(
    postId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."PostsLikesOrDislike"
    SET "Status"=$1, "CreatedAt"=$2
    WHERE "UserId" = $3 AND "PostId" = $4;`,
        [likeStatus, new Date(), userId, postId],
      );
    } catch (error) {}
  }

  private async getMyLikeStatusForPostOrComment(
    postIdOrCommentId: string,
    userId: string,
    postOrComment: string,
  ): Promise<LikeType> {
    let table: string;
    let stringWhere: string;

    if (postOrComment === 'post') {
      table = 'PostsLikesOrDislike';
      stringWhere = 'PostId';
    }
    if (postOrComment === 'comment') {
      table = 'CommentsLikesOrDislike';
      stringWhere = 'CommentId';
    }

    let myStatus = [];

    try {
      myStatus = await this.dataSource.query(
        `
    SELECT "Status" as "myStatus"
    FROM public.${'"' + table + '"'}
    WHERE ${'"' + stringWhere + '"'} = $1 AND "UserId" = $2`,
        [postIdOrCommentId, userId],
      );
    } catch (error) {
      myStatus = [];
    }

    if (myStatus.length === 0) return 'None';
    else return myStatus[0].myStatus;
  }

  async getMyLikeStatusForPost(
    postId: string,
    userId: string,
  ): Promise<LikeType> {
    return this.getMyLikeStatusForPostOrComment(postId, userId, 'post');
  }

  async removeLikeOrDislikeForPost(postId: string, userId: string) {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public."PostsLikesOrDislike"
    WHERE "PostId" = $1 AND "UserId" = $2;`,
        [postId, userId],
      );
    } catch (error) {
      return null;
    }
  }

  async getMyLikeStatusForComment(commentId: string, userId: string) {
    return this.getMyLikeStatusForPostOrComment(commentId, userId, 'comment');
  }

  async saveLikeOrUnlikeForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.dataSource.query(
        `
    INSERT INTO public."CommentsLikesOrDislike"(
        "UserId", "CommentId", "Status", "CreatedAt")
    VALUES ($1, $2, $3, $4);`,
        [userId, commentId, likeStatus, new Date()],
      );
    } catch (error) {
      return null;
    }
  }

  async changeLikeStatusForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeType,
  ) {
    try {
      await this.dataSource.query(
        `
    UPDATE public."CommentsLikesOrDislike"
    SET "Status"=$1, "CreatedAt"=$2
    WHERE "UserId" = $3 AND "CommentId" = $4;`,
        [likeStatus, new Date(), userId, commentId],
      );
    } catch (error) {}
  }

  async removeLikeOrDislikeForComment(commentId: string, userId: string) {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public."CommentsLikesOrDislike"
    WHERE "CommentId" = $1 AND "UserId" = $2;`,
        [commentId, userId],
      );
    } catch (error) {
      return null;
    }
  }

  async getThreeNewestLikesForPost(postId: string) {
    return this.dataSource.query(
      `
    SELECT pl."CreatedAt" as "addedAt", pl."UserId":: character varying as "userId", u."Login" as "login" 
    FROM public."PostsLikesOrDislike" pl
    JOIN public."Users" u
    ON pl."UserId" = u."UserId"
    JOIN public."BanInfo" b
    ON b."UserId" = u."UserId"
    WHERE "Status" = 'Like' AND pl."PostId" = $1 AND b."IsBanned" = false
    ORDER BY "addedAt" desc
    LIMIT 3 OFFSET 0`,
      [postId],
    );
  }

  async updateNewestLikesForPost(
    postId: string,
    threeNewestLikes: NewestLikesType[],
  ) {
    await this.dataSource.query(
      `
    UPDATE public."Posts"
    SET "NewestLikes"=$2
    WHERE "PostId" = $1;`,
      [postId, threeNewestLikes],
    );
  }
}
