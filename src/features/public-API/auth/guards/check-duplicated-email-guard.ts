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
export class CheckDuplicatedEmailGuard implements CanActivate {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const duplicatedEmail = await this.userModel.find({
      email: request.body.email,
    });
    if (duplicatedEmail.length > 0)
      throw new BadRequestException(createErrorMessage('email'));
    return true;
  }
}
