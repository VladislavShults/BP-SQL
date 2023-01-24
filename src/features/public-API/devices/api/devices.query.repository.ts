import { Injectable } from '@nestjs/common';
import {
  DevicesResponseType,
  DevicesSecuritySessionType,
} from '../types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async getActiveSessionCurrentUser(
    userId: string,
  ): Promise<DevicesResponseType[]> {
    const activeSessions: DevicesSecuritySessionType[] =
      await this.dataSource.query(
        `
      SELECT "Ip" as "ip", "DeviceName" as "deviceName", "LastActiveDate" as "lastActiveDate", "DeviceId" as "deviceId"
      FROM public."DeviceSession"
      WHERE "UserId" = $1;`,
        [userId],
      );

    return activeSessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    }));
  }
}
