import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { Model } from 'mongoose';
import { UserDBType } from '../../../SA-API/users/types/users.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) throw new UnauthorizedException();
    const token: string = request.headers.authorization.split(' ')[1];
    const userId = await this.jwtUtility.extractUserIdFromToken(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();
    request.user = user;
    return true;
  }
}
