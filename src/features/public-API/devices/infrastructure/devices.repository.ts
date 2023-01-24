import { Injectable } from '@nestjs/common';
import { DevicesSecuritySessionType } from '../types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async deleteDeviceSession(userId: string, deviceId: string) {
    await this.dataSource.query(
      `
    DELETE FROM public."DeviceSession"
    WHERE "UserId" = $1 AND "DeviceId" = $2;`,
      [userId, deviceId],
    );
  }

  async findDeviceByIssueAtAndUserId(
    issueAt: string,
    userId: string,
  ): Promise<boolean> {
    const deviceIdArray = await this.dataSource.query(
      `
    SELECT "DeviceId"
    FROM "DeviceSession"
    WHERE "UserId" = $1 AND "IssuedAt" = $2
    `,
      [userId, issueAt],
    );

    return deviceIdArray.length !== 0;
  }

  async terminateAllSessionExceptThis(userId: string, deviceId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public."DeviceSession"
        WHERE "DeviceId" NOT IN ($1) AND "UserId" = $2`,
      [deviceId, userId],
    );
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<DevicesSecuritySessionType[] | null> {
    return this.dataSource.query(
      `
    SELECT "DeviceSessionId" as "deviceSessionId", "DeviceId" as "deviceId", "Ip" as "ip", "DeviceName" as "deviceName",
            "UserId" as "userId", "LastActiveDate" as "lastActiveDate", "ExpiresAt" as "expiresAt", "IssuedAt" as "issuedAt"
    FROM public."DeviceSession"
    WHERE "DeviceId" = $1`,
      [deviceId],
    );
  }

  async saveDeviceInputInDB(
    newInput: Omit<DevicesSecuritySessionType, 'deviceSessionId'>,
  ): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public."DeviceSession"(
        "DeviceId", "Ip", "DeviceName", "UserId", "LastActiveDate", "ExpiresAt", "IssuedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        newInput.deviceId,
        newInput.ip,
        newInput.deviceName,
        newInput.userId,
        newInput.lastActiveDate,
        newInput.expiresAt,
        newInput.issuedAt,
      ],
    );
  }

  async changeRefreshTokenInDeviceSession(
    issuedAtOldToken: string,
    userIdOldToken: string,
    issuedAtNewToken: string,
    expiresAtNewToken: string,
    ip: string,
  ) {
    try {
      await this.dataSource.query(
        `
      UPDATE public."DeviceSession"
      SET "Ip"=$1, "LastActiveDate"=$2, "ExpiresAt"=$3, "IssuedAt"=$4
      WHERE "UserId" = $5 AND "IssuedAt" = $6;`,
        [
          ip,
          new Date(),
          expiresAtNewToken,
          issuedAtNewToken,
          userIdOldToken,
          issuedAtOldToken,
        ],
      );
    } catch (error) {
      return null;
    }
  }
}
