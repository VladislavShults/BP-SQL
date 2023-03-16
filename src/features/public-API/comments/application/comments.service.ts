import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../api/models/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async createCommentByPost(
    postId: string,
    inputModel: CreateCommentDto,
    userId: string,
  ): Promise<number> {
    return await this.commentsRepository.createComment(
      inputModel.content,
      postId,
      userId,
    );
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(commentId);
  }

  async updateComment(commentId: string, content: string) {
    return await this.commentsRepository.updateComment(commentId, content);
  }
}
