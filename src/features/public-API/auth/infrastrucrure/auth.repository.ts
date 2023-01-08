import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { DevicesSecuritySessionType } from '../../devices/types/devices.types';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('DEVICE_SECURITY_MODEL')
    private readonly devicesSecurityModel: Model<DevicesSecuritySessionType>,
  ) {}

  async saveDeviceInputInDB(
    newInput: Omit<DevicesSecuritySessionType, '_id'>,
  ): Promise<ObjectId> {
    const result = await this.devicesSecurityModel.create(newInput);
    return result._id;
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

  async deleteRefreshToken(userId: string, issuedAtToken: string) {
    await this.devicesSecurityModel.deleteMany({
      userId: userId,
      issuedAt: issuedAtToken,
    });
  }
}
