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
import { UsersQueryRepository } from '../api/users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
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

      return;
    }
    if (!banModel.isBanned && user.banInfo.isBanned) {
      const banInfo = {
        isBanned: banModel.isBanned,
        banDate: null,
        banReason: null,
      };
      await this.usersRepository.banOrUnbanUser(userId, banInfo);

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
