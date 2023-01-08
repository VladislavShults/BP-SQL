import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../types/devices.types';

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
  ) {}

  async terminateAllSessionExceptThis(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.devicesSecurityModel.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId },
    });
  }

  async terminateSpecificDeviceSession(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const deleteSession = await this.devicesSecurityModel.deleteMany({
      userId: userId,
      deviceId: deviceId,
    });
    return deleteSession.deletedCount > 0;
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<DevicesSecuritySessionType | null> {
    const sessionsByDeviceCount: number = await this.devicesSecurityModel
      .count({
        deviceId: deviceId,
      })
      .lean();
    if (sessionsByDeviceCount === 0) return null;
    return this.devicesSecurityModel
      .find({
        deviceId: deviceId,
      })
      .lean();
  }

  async terminateAllSessionByUserId(userId: string): Promise<boolean> {
    const deleteSession = await this.devicesSecurityModel.deleteMany({
      userId: userId,
    });
    return deleteSession.deletedCount > 0;
  }
}
