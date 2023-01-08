import { UsersRepository } from '../../../SA-API/users/infrastructure/users.repository';
import { Inject, Injectable } from '@nestjs/common';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { v4 as uuid } from 'uuid';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { extractUserIdFromRefreshToken } from '../helpers/extractUserIdFromRefreshToken';
import { extractIssueAtFromRefreshToken } from '../helpers/extractIssueAtFromRefreshToken';
import { extractExpiresDateFromRefreshToken } from '../helpers/extractExpiresDateFromRefreshToken';
import { AuthRepository } from '../infrastrucrure/auth.repository';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../../devices/types/devices.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtUtility: JwtService,
    private readonly authRepository: AuthRepository,
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly securityDevicesModel: Model<DevicesSecuritySessionType>,
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
    const user = await this.usersRepository.getUserByEmail(email);
    if (!user) return null;
    user.emailConfirmation.confirmationCode = uuid();
    user.emailConfirmation.expirationDate = add(new Date(), { hours: 5 });
    const update = await this.usersRepository.updateUser(user);
    if (update) return user.emailConfirmation.confirmationCode;
    return null;
  }

  async findAccountByConfirmationCode(
    code: string,
  ): Promise<UserDBType | null> {
    const account = await this.usersRepository.findAccountByConfirmationCode(
      code,
    );
    if (!account) return null;
    if (new Date() > account.emailConfirmation.expirationDate) return null;
    return account;
  }

  async confirmAccount(accountId: string): Promise<boolean> {
    return await this.usersRepository.confirmedAccount(accountId);
  }

  async accountIsConfirmed(email: string): Promise<boolean> {
    return await this.usersRepository.accountIsConfirmed(email);
  }

  async saveDeviceInputInDB(
    refreshToken: string,
    ip: string,
    deviceName: string | undefined,
  ): Promise<ObjectId> {
    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);
    const deviceId = await this.jwtUtility.extractDeviceIdFromToken(
      refreshToken,
    );
    const issueAt = extractIssueAtFromRefreshToken(refreshToken);
    const expiresAt = extractExpiresDateFromRefreshToken(refreshToken);
    if (userId && deviceId && issueAt && deviceName && expiresAt) {
      const newInput: Omit<DevicesSecuritySessionType, '_id'> = {
        issuedAt: issueAt,
        deviceId: deviceId.toString(),
        ip: ip,
        deviceName: deviceName,
        userId: userId.toString(),
        expiresAt: expiresAt,
        lastActiveDate: new Date(),
      };
      return await this.authRepository.saveDeviceInputInDB(newInput);
    }
  }

  async updateRefreshToken(
    oldRefreshToken: string,
    newRefreshToken: string,
    ip: string,
  ): Promise<void> {
    const issuedAtOldToken = extractIssueAtFromRefreshToken(oldRefreshToken);
    const userIdOldToken = extractUserIdFromRefreshToken(oldRefreshToken);
    const issuedAtNewToken = extractIssueAtFromRefreshToken(newRefreshToken);
    const expiresAtNewToken =
      extractExpiresDateFromRefreshToken(newRefreshToken);
    const token = await this.authRepository.findTokenByUserIdAndIssuedAt(
      userIdOldToken,
      issuedAtOldToken,
    );
    token.issuedAt = issuedAtNewToken;
    token.ip = ip;
    token.expiresAt = expiresAtNewToken;
    token.lastActiveDate = new Date();
    await this.authRepository.updateToken(token);
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    const issuedAtToken = await this.jwtUtility.extractIssueAtFromToken(
      refreshToken,
    );
    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);
    await this.authRepository.deleteRefreshToken(
      userId.toString(),
      issuedAtToken.toString(),
    );
  }

  async changePassword(newPasswordHash: string, userId: string): Promise<void> {
    const user = await this.usersRepository.getUser(userId);
    user.passwordHash = newPasswordHash;
    await this.usersRepository.updateUser(user);
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
    const tokenInDB = await this.securityDevicesModel.findOne({
      issuedAt: issueAtToken,
      userId: userIdFromToken,
    });

    if (!tokenInDB) return false;

    return true;
  }
}
