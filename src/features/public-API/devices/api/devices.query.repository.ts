import { Inject, Injectable } from '@nestjs/common';
import {
  DevicesResponseType,
  DevicesSecuritySessionType,
} from '../types/devices.types';
import { Model } from 'mongoose';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly deviceSecurityModel: Model<DevicesSecuritySessionType>,
  ) {}
  async getActiveSessionCurrentUser(
    userId: string,
  ): Promise<DevicesResponseType[]> {
    const activeSession: DevicesSecuritySessionType[] =
      await this.deviceSecurityModel.find({ userId: userId }).lean();
    return activeSession.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    }));
  }
}
