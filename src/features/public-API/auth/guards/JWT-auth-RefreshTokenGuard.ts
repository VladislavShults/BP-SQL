import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class JWTAuthRefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken || null;

    const userId = await this.jwtUtility.extractUserIdFromToken(refreshToken);
    if (!userId) throw new UnauthorizedException();

    const user = await this.dataSource.query(
      `
    SELECT "UserId" as "userId", "Login" as "login"
    FROM public."Users"
    WHERE "UserId" = $1`,
      [userId],
    );

    if (user.length === 0) throw new UnauthorizedException();

    request.user = user[0];

    return true;
  }
}
