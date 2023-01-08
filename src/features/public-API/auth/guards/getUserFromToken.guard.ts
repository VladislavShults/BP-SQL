import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { Model } from 'mongoose';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class GetUserFromToken implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) return true;
    const token: string = request.headers.authorization.split(' ')[1];
    const userId = await this.jwtUtility.extractUserIdFromToken(token);
    if (!userId) return true;
    const user = await this.userModel.findById(userId);
    if (!user) return true;
    request.user = user;
    return true;
  }
}
