import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsQueryRepository } from '../api/comments.query.repository';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { Model } from 'mongoose';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class CheckOwnerComment implements CanActivate {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly jwtUtility: JwtService,
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) throw new UnauthorizedException();
    const token: string = request.headers.authorization.split(' ')[1];
    const userId = await this.jwtUtility.extractUserIdFromToken(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();

    const params = request.params;
    if (params.commentId.length !== 24)
      throw new HttpException('COMMENT NOT FOUND', HttpStatus.NOT_FOUND);
    const comment = await this.commentsQueryRepository.getCommentById(
      params.commentId,
    );
    if (comment.userId !== user._id.toString())
      throw new HttpException('alien comment', HttpStatus.FORBIDDEN);
    return true;
  }
}
