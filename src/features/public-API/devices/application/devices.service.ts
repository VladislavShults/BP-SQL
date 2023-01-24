import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../types/devices.types';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { DeviceRepository } from '../infrastructure/devices.repository';
import { extractIssueAtFromRefreshToken } from '../../auth/helpers/extractIssueAtFromRefreshToken';
import { extractExpiresDateFromRefreshToken } from '../../auth/helpers/extractExpiresDateFromRefreshToken';
import { extractUserIdFromRefreshToken } from '../../auth/helpers/extractUserIdFromRefreshToken';

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
    private readonly jwtUtility: JwtService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async terminateAllSessionExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.deviceRepository.terminateAllSessionExceptThis(userId, deviceId);
  }

  async terminateSpecificDeviceSession(
    deviceId: string,
    userId: string,
  ): Promise<void> {
    await this.deviceRepository.deleteDeviceSession(userId, deviceId);
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<DevicesSecuritySessionType> {
    const sessionsByDeviceIdArray =
      await this.deviceRepository.getSessionByDeviceId(deviceId);
    if (sessionsByDeviceIdArray.length === 0) return null;
    else return sessionsByDeviceIdArray[0];
  }

  async terminateAllSessionByUserId(userId: string): Promise<boolean> {
    const deleteSession = await this.devicesSecurityModel.deleteMany({
      userId: userId,
    });
    return deleteSession.deletedCount > 0;
  }

  async deleteDeviceSession(refreshToken: string): Promise<void> {
    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);

    const deviceId = await this.jwtUtility.extractDeviceIdFromToken(
      refreshToken,
    );

    await this.deviceRepository.deleteDeviceSession(userId, deviceId);
  }

  async findDeviceByIssueAtAndUserId(
    issueAt: string,
    userId: string,
  ): Promise<boolean> {
    return this.deviceRepository.findDeviceByIssueAtAndUserId(issueAt, userId);
  }

  async saveDeviceInputInDB(
    refreshToken: string,
    ip: string,
    deviceName: string | undefined,
  ): Promise<void> {
    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);
    const deviceId = await this.jwtUtility.extractDeviceIdFromToken(
      refreshToken,
    );
    const issueAt = extractIssueAtFromRefreshToken(refreshToken);
    const expiresAt = extractExpiresDateFromRefreshToken(refreshToken);
    if (userId && deviceId && issueAt && deviceName && expiresAt) {
      const newInput: Omit<DevicesSecuritySessionType, 'deviceSessionId'> = {
        issuedAt: issueAt,
        deviceId: deviceId.toString(),
        ip,
        deviceName,
        userId: Number(userId),
        expiresAt: expiresAt,
        lastActiveDate: new Date(),
      };
      await this.deviceRepository.saveDeviceInputInDB(newInput);
    }
  }

  async changeRefreshTokenInDeviceSession(
    oldRefreshToken: string,
    newRefreshToken: string,
    ip: string,
  ): Promise<void> {
    const issuedAtOldToken = extractIssueAtFromRefreshToken(oldRefreshToken);
    const userIdOldToken = extractUserIdFromRefreshToken(oldRefreshToken);
    const issuedAtNewToken = extractIssueAtFromRefreshToken(newRefreshToken);
    const expiresAtNewToken =
      extractExpiresDateFromRefreshToken(newRefreshToken);

    await this.deviceRepository.changeRefreshTokenInDeviceSession(
      issuedAtOldToken,
      userIdOldToken,
      issuedAtNewToken,
      expiresAtNewToken,
      ip,
    );
  }
}
