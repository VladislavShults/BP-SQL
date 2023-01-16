import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceRepository {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}
  async deleteDeviceSession(userId: number, deviceId: number) {
    await this.dataSource.query(
      `
    DELETE FROM public."DeviceSession"
    WHERE "UserId" = $1 AND "DeviceId" = $2;`,
      [userId, deviceId],
    );
  }

  async findDeviceByIssueAtAndUserId(
    issueAt: number,
    userId: number,
  ): Promise<boolean> {
    const deviceIdArray = await this.dataSource.query(
      `
    SELECT "DeviceId"
    FROM public."DeviceSession"
    WHERE "UserId" = $1 AND "IssueAt" = $2
    `,
      [userId, issueAt],
    );

    return deviceIdArray.length !== 0;
  }

  async terminateAllSessionExceptThis(userId: number, deviceId: number) {
    await this.dataSource.query(
      `
        DELETE FROM public."DeviceSession"
        WHERE "DeviceId" NOT IN ($1) AND "UserId" = $2`,
      [deviceId, userId],
    );
  }

  async getSessionByDeviceId(
    deviceId: number,
  ): Promise<DevicesSecuritySessionType[] | null> {
    return this.dataSource.query(
      `
    SELECT "DeviceSessionId" as "deviceSessionId", "DeviceId" as "deviceId", "Ip" as "ip", "DeviceName" as "deviceName",
            "UserId" as "UserId", "LastActiveDate" as "lastActiveDate", "ExpiresAt" as "expiresAt", "IssuedAt" as "issuedAt"
    FROM public."DeviceSession"
    WHERE "DeviceId" = $1`,
      [deviceId],
    );
  }
}
