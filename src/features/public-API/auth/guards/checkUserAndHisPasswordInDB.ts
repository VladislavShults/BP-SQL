import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDBType } from '../../../SA-API/users/types/users.types';
import { Request } from 'express';
import { AuthService } from '../application/auth.service';

@Injectable()
export class CheckUserAndHisPasswordInDB implements CanActivate {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDBType>,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    let user: UserDBType | null = null;

    const accountByEmail = await this.userModel.findOne({
      email: request.body.loginOrEmail,
    });
    if (accountByEmail) {
      user = accountByEmail;
    }
    const accountByLogin = await this.userModel.findOne({
      login: request.body.loginOrEmail,
    });
    if (accountByLogin) {
      user = accountByLogin;
    }

    if (!user) throw new HttpException('', HttpStatus.UNAUTHORIZED);

    const passwordValid = await this.authService.isPasswordCorrect(
      request.body.password,
      user.passwordHash,
    );
    if (!passwordValid) throw new HttpException('', HttpStatus.UNAUTHORIZED);

    request.user = user;

    return true;
  }
}
