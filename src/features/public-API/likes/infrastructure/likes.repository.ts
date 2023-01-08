import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BannedLikesOrDislikes, LikeDBType } from '../types/likes.types';

@Injectable()
export class LikesRepository {
  constructor(
    @Inject('LIKES_MODEL')
    private readonly likesModel: Model<LikeDBType>,
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
}
