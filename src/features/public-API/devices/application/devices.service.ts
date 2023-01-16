import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../types/devices.types';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { DeviceRepository } from '../infrastructure/devices.repository';

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
    private readonly jwtUtility: JwtService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async terminateAllSessionExceptThis(
    userId: number,
    deviceId: number,
  ): Promise<void> {
    await this.deviceRepository.terminateAllSessionExceptThis(userId, deviceId);
  }

  async terminateSpecificDeviceSession(
    deviceId: number,
    userId: number,
  ): Promise<void> {
    await this.deviceRepository.deleteDeviceSession(userId, deviceId);
  }

  async findSessionByDeviceId(
    deviceId: number,
  ): Promise<DevicesSecuritySessionType | null> {
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

  async findDeviceByIssueAtAndUserId(issueAt: number, userId: number) {
    return this.deviceRepository.findDeviceByIssueAtAndUserId(issueAt, userId);
  }
}
