import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { Request } from 'express';
import { createErrorMessage } from '../helpers/create-error-message';

@Injectable()
export class CheckDuplicatedLoginGuard implements CanActivate {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const duplicatedLogin = await this.userModel.find({
      login: request.body.login,
    });
    if (duplicatedLogin.length > 0)
      throw new BadRequestException(createErrorMessage('login'));
    return true;
  }
}
