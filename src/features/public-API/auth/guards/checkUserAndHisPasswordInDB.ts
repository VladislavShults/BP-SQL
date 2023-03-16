import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersForCheckInDB } from '../../../SA-API/users/types/users.types';
import { Request } from 'express';
import { AuthService } from '../application/auth.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CheckUserAndHisPasswordInDB implements CanActivate {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    let user: UsersForCheckInDB | null = null;

    const accountByLoginOrEmail = await this.dataSource.query(
      `
    SELECT u."UserId" as "userId", u."Login" as "login", u."Email" as "email", u."PasswordHash" as "passwordHash",
           b."IsBanned" as "isBanned"
    FROM public."Users" u
    JOIN public."BanInfo" b
    ON u."UserId" = b."UserId"
    WHERE u."IsDeleted" = false AND u."Login" = $1
    OR(u."IsDeleted" = false AND u."Email" = $1)`,
      [request.body.loginOrEmail],
    );

    if (accountByLoginOrEmail.length > 0) {
      user = accountByLoginOrEmail[0];
    } else throw new HttpException('', HttpStatus.UNAUTHORIZED);

    const passwordValid = await this.authService.isPasswordCorrect(
      request.body.password,
      user.passwordHash,
    );
    if (!passwordValid || user.isBanned)
      throw new HttpException('', HttpStatus.UNAUTHORIZED);

    request.user = user;

    return true;
  }
}
