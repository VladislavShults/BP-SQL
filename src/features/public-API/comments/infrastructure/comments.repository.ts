import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CommentDBType } from '../types/comments.types';

@Injectable()
export class CommentsRepository {
  constructor(
    @Inject('COMMENT_MODEL')
    private readonly commentModel: Model<CommentDBType>,
  ) {}

  async createComment(comment: Omit<CommentDBType, '_id'>) {
    const newComment = await this.commentModel.create(comment);
    return newComment._id;
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    if (commentId.length !== 24) return false;
    const deleteComment = await this.commentModel.deleteOne({ _id: commentId });
    return deleteComment.deletedCount > 0;
  }

  async getCommentById(commentId: string) {
    return this.commentModel.findById(commentId);
  }

  async updateComment(comment): Promise<boolean> {
    const update = await comment.save();
    return update.modifiedPaths.length > 0;
  }

  async banComments(userId: string) {
    await this.commentModel.updateMany(
      { userId: userId },
      { $set: { isBanned: true } },
    );
  }

  async unbanComments(userId: string) {
    await this.commentModel.updateMany(
      { userId: userId },
      { $set: { isBanned: false } },
    );
  }
}
