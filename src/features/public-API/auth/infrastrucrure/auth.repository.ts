import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DevicesSecuritySessionType } from '../../devices/types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

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

  async findTokenByUserIdAndIssuedAt(
    userIdOldToken: string,
    issuedAtOldToken: string,
  ) {
    return this.devicesSecurityModel.findOne({
      userId: userIdOldToken,
      issuedAt: issuedAtOldToken,
    });
  }

  async updateToken(token) {
    await token.save();
  }
}
