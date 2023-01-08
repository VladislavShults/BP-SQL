import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../api/models/create-comment.dto';
import { CommentDBType } from '../types/comments.types';
import { ObjectId } from 'mongodb';
import { LikeDBType, LikeType } from '../../likes/types/likes.types';
import { LikesService } from '../../likes/application/likes.service';
import { UserDBType } from '../../../SA-API/users/types/users.types';
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
    user: UserDBType,
  ): Promise<ObjectId> {
    const post = await this.postsService.getPostById(postId);

    const comment: Omit<CommentDBType, '_id'> = {
      content: inputModel.content,
      userId: user._id.toString(),
      userLogin: user.login,
      createdAt: new Date(),
      postId: postId,
      likesCount: 0,
      dislikesCount: 0,
      isBanned: false,
      blogId: post.blogId,
      postInfo: {
        id: post._id.toString(),
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
        postOwnerUserId: post.userId,
      },
    };

    return await this.commentsRepository.createComment(comment);
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(commentId);
  }

  async updateComment(commentId: string, content: string) {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return null;
    comment.content = content;
    return await this.commentsRepository.updateComment(comment);
  }

  async makeLikeOrUnlike(
    commentId: string,
    user,
    likeStatus: LikeType,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return false;
    if (likeStatus === 'Like') {
      return await this.makeLike(commentId, user);
    }
    if (likeStatus === 'Dislike') {
      return await this.makeDislike(commentId, user);
    }
    if (likeStatus === 'None') {
      return await this.resetLike(commentId, user);
    }
    return true;
  }

  private async makeLike(commentId: string, user): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    const myLike = await this.likesService.findLikeByUserIdAndCommentId(
      user._id.toString(),
      commentId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (comment && myStatus === 'Dislike') {
      comment.likesCount += 1;
      comment.dislikesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'Like';
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (comment && myStatus === null) {
      comment.likesCount += 1;
      const like: Omit<LikeDBType, '_id'> = {
        idObject: comment._id,
        userId: user._id,
        login: user.login,
        addedAt: new Date(),
        status: 'Like',
        postOrComment: 'comment',
        isBanned: false,
      };
      await this.commentsRepository.updateComment(comment);
      await this.likesService.saveLikeOrUnlike(like);
      return true;
    }
    if (comment && myStatus === 'None') {
      comment.likesCount += 1;
      myLike.status = 'Like';
      myLike.addedAt = new Date();
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  private async makeDislike(commentId: string, user): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    const myLike = await this.likesService.findLikeByUserIdAndCommentId(
      user._id.toString(),
      commentId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (comment && myStatus === 'Like') {
      comment.likesCount -= 1;
      comment.dislikesCount += 1;
      myLike.addedAt = new Date();
      myLike.status = 'Dislike';
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (comment && myStatus === null) {
      comment.dislikesCount += 1;
      const like: Omit<LikeDBType, '_id'> = {
        idObject: comment._id,
        userId: user._id,
        login: user.login,
        addedAt: new Date(),
        status: 'Dislike',
        postOrComment: 'comment',
        isBanned: false,
      };
      await this.commentsRepository.updateComment(comment);
      await this.likesService.saveLikeOrUnlike(like);
      return true;
    }
    if (comment && myStatus === 'None') {
      comment.dislikesCount += 1;
      myLike.status = 'Dislike';
      myLike.addedAt = new Date();
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  private async resetLike(commentId: string, user): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    const myLike = await this.likesService.findLikeByUserIdAndCommentId(
      user._id.toString(),
      commentId,
    );

    let myStatus: string;
    if (!myLike) myStatus = null;
    else myStatus = myLike.status;

    if (comment && myStatus === 'Like') {
      comment.likesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'None';
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    if (comment && myStatus === 'Dislike') {
      comment.dislikesCount -= 1;
      myLike.addedAt = new Date();
      myLike.status = 'None';
      await this.commentsRepository.updateComment(comment);
      await this.likesService.updateLike(myLike);
      return true;
    }
    return true;
  }

  async banComments(userId: string) {
    await this.commentsRepository.banComments(userId);
  }

  async unbanComments(userId: string) {
    await this.commentsRepository.unbanComments(userId);
  }

  async correctLikeAndDislikeCountersBan(commentId: string, status: LikeType) {
    const comment = await this.commentsRepository.getCommentById(
      commentId.toString(),
    );
    if (status === 'Like') comment.likesCount -= 1;
    if (status === 'Dislike') comment.dislikesCount -= 1;
    await this.commentsRepository.updateComment(comment);
  }

  async correctLikeAndDislikeCountersUnban(
    commentId: string,
    status: LikeType,
  ) {
    const comment = await this.commentsRepository.getCommentById(
      commentId.toString(),
    );
    if (status === 'Like') comment.likesCount += 1;
    if (status === 'Dislike') comment.dislikesCount += 1;
    await this.commentsRepository.updateComment(comment);
  }
}
