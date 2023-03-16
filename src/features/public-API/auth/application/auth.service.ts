import { UsersRepository } from '../../../SA-API/users/infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { DevicesService } from '../../devices/application/devices.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtUtility: JwtService,
    private readonly devicesService: DevicesService,
  ) {}

  generateHash(password: string) {
    return bcrypt.hash(password, 10);
  }

  async isPasswordCorrect(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async createAccessToken(userId: string, expirationTime: string) {
    return await this.jwtUtility.createJWT(userId, expirationTime);
  }

  async createRefreshToken(userId: string, expirationTime: string) {
    return await this.jwtUtility.createRefreshJWT(
      userId,
      uuid().toString(),
      expirationTime,
    );
  }

  async refreshConfirmationCode(email: string): Promise<string | null> {
    const userId = await this.usersRepository.checkUserByEmailInDB(email);
    if (!userId) return null;

    const newConfirmationData = {
      confirmationCode: uuid(),
      expirationDate: add(new Date(), { hours: 5 }),
    };

    await this.usersRepository.refreshConfirmationCodeAndDate(
      userId,
      newConfirmationData,
    );

    return newConfirmationData.confirmationCode;
  }

  async findAccountByConfirmationCode(code: string) {
    const account = await this.usersRepository.findAccountByConfirmationCode(
      code,
    );
    if (!account) return null;
    if (new Date() > account.expirationDate) return null;
    return account;
  }

  async confirmAccount(code: string): Promise<boolean> {
    return await this.usersRepository.confirmedAccount(code);
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    return await this.usersRepository.accountIsConfirmed(email);
  }

  async changePassword(newPasswordHash: string, userId: string): Promise<void> {
    await this.usersRepository.changePassword(newPasswordHash, userId);
  }

  async checkRefreshTokenForValid(
    refreshToken: string | null,
  ): Promise<boolean> {
    if (!refreshToken) return false;

    const tokenExpirationDate =
      await this.jwtUtility.extractExpirationDateFromToken(refreshToken);
    if (+new Date() > tokenExpirationDate) return false;

    const issueAtToken = await this.jwtUtility.extractIssueAtFromToken(
      refreshToken,
    );

    const userIdFromToken = await this.jwtUtility.extractUserIdFromToken(
      refreshToken,
    );

    return await this.devicesService.findDeviceByIssueAtAndUserId(
      issueAtToken,
      userIdFromToken,
    );
  }
}
