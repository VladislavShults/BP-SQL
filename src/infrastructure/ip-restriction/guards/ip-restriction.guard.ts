import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Model } from 'mongoose';
import { IpRestrictionType } from '../types/ip-restriction.types';

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  constructor(
    @Inject('IP_RESTRICTION_MODEL')
    private readonly ipRestrictionModel: Model<IpRestrictionType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const url = request.url;
    const ip = request.ip;

    const inputCount = await this.ipRestrictionModel.count({
      endpoint: url,
      currentIp: ip,
      timeInput: { $gt: +new Date() - 12500 },
    });
    if (inputCount >= 5)
      throw new HttpException('ip-restriction', HttpStatus.TOO_MANY_REQUESTS);

    const input: IpRestrictionType = {
      endpoint: url,
      currentIp: ip,
      timeInput: +new Date(),
    };
    await this.ipRestrictionModel.create(input);
    // await this.ipRestrictionModel.deleteMany({
    //   timeInput: { $lt: +new Date() - 15000 },
    // });
    return true;
  }
}
