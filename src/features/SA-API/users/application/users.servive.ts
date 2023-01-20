import { Injectable } from '@nestjs/common';
import { addHours } from 'date-fns';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../api/models/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  EmailConfirmationType,
  UserForTypeOrmType,
} from '../types/users.types';
import { BanUserDto } from '../api/models/ban-user.dto';
import { AuthService } from '../../../public-API/auth/application/auth.service';
import { DevicesService } from '../../../public-API/devices/application/devices.service';
import { CommentsService } from '../../../public-API/comments/application/comments.service';
import { PostsService } from '../../../public-API/posts/application/posts.service';
import { LikesService } from '../../../public-API/likes/application/likes.service';
import { UsersQueryRepository } from '../api/users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly devicesService: DevicesService,
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    inputModel: CreateUserDto,
  ): Promise<{ userId: number; confirmationCode: string }> {
    const hash = await this.authService.generateHash(inputModel.password);

    const confirmationCode = uuidv4();

    const user: UserForTypeOrmType = {
      login: inputModel.login,
      email: inputModel.email,
      createdAt: new Date(),
      passwordHash: hash,
    };

    const userId = await this.usersRepository.createUser(user);

    const emailConfirmation: EmailConfirmationType = {
      confirmationCode,
      expirationDate: addHours(new Date(), 5),
      isConfirmed: false,
      userId,
    };

    await this.usersRepository.saveEmailConfirmation(emailConfirmation);

    await this.usersRepository.createBanInfoForUser(userId);

    return { userId, confirmationCode };
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await this.usersRepository.getUser(userId);

    if (!user || user.IsDeleted) return false;

    return await this.usersRepository.deleteUserById(userId);
  }

  async banAndUnbanUser(
    userId: string,
    banModel: BanUserDto,
  ): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByIdJoinBanInfoType(
      Number(userId),
    );
    if (!user) return false;
    if (banModel.isBanned && !user.banInfo.isBanned) {
      const banInfo = {
        isBanned: banModel.isBanned,
        banDate: new Date(),
        banReason: banModel.banReason,
      };

      await this.usersRepository.banOrUnbanUser(userId, banInfo);

      // await this.devicesService.terminateAllSessionByUserId(userId);
      // await this.postsService.banPosts(userId);
      // await this.likesService.banLikes(userId);
      // await this.commentsService.banComments(userId);
      // const bannedLikesForPosts =
      //   await this.likesService.getBannedLikesForPostsByUser(userId);
      // for await (const element of bannedLikesForPosts) {
      //   await this.postsService.correctLikeAndDislikeCountersBan(
      //     element.idObject.toString(),
      //     element.status,
      //   );
      // }//
      // const bannedLikesForComments =
      //   await this.likesService.getBannedLikesForCommentsByUser(userId);
      // for await (const element of bannedLikesForComments) {
      //   await this.commentsService.correctLikeAndDislikeCountersBan(
      //     element.idObject.toString(),
      //     element.status,
      //   );
      // }

      return;
    }
    if (!banModel.isBanned && user.banInfo.isBanned) {
      const banInfo = {
        isBanned: banModel.isBanned,
        banDate: null,
        banReason: null,
      };
      await this.usersRepository.banOrUnbanUser(userId, banInfo);

      // const bannedLikesForPosts =
      //   await this.likesService.getBannedLikesForPostsByUser(userId);
      //
      // for (const element of bannedLikesForPosts) {
      //   await this.postsService.correctLikeAndDislikeCountersUnban(
      //     element.idObject.toString(),
      //     element.status,
      //   );
      // }
      // await this.postsService.unbanPosts(userId);
      // const bannedLikesForComments =
      //   await this.likesService.getBannedLikesForCommentsByUser(userId);
      // for (const element of bannedLikesForComments) {
      //   await this.commentsService.correctLikeAndDislikeCountersUnban(
      //     element.idObject.toString(),
      //     element.status,
      //   );
      // }
      // await this.commentsService.unbanComments(userId);
      // await this.likesService.unbanLikes(userId);
      return;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository.findByLoginOrEmail(loginOrEmail);
  }

  async findUserById(userId: string) {
    return this.usersRepository.getUser(userId);
  }
}
