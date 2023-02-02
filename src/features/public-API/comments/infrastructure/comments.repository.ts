import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CommentDBType } from '../types/comments.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @Inject('COMMENT_MODEL')
    private readonly commentModel: Model<CommentDBType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

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

  async createComment(
    content: string,
    postId: string,
    userId: string,
  ): Promise<number> {
    const newComment = await this.dataSource.query(
      `
    INSERT INTO public."Comments"("Content", "UserId","PostId")
    VALUES ($1, $2, $3)
    RETURNING "CommentId" as "commentId"`,
      [content, userId, postId],
    );

    return newComment[0].commentId;
  }
}
