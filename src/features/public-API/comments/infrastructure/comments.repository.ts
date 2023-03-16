import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteCommentById(commentId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
      UPDATE public."Comments"
    SET "IsDeleted"=true
    WHERE "CommentId" = $1;`,
        [commentId],
      );
    } catch (error) {
      return null;
    }
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.dataSource.query(
      `
    UPDATE public."Comments"
    SET "Content"=$1
    WHERE "CommentId" = $2;`,
      [content, commentId],
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
