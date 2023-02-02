import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../api/models/create-comment.dto';
import { LikesService } from '../../likes/application/likes.service';
import { PostsService } from '../../posts/application/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
    private readonly postsService: PostsService,
  ) {}

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

  async banComments(userId: string) {
    await this.commentsRepository.banComments(userId);
  }

  async unbanComments(userId: string) {
    await this.commentsRepository.unbanComments(userId);
  }
}
