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
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) throw new UnauthorizedException();

    const token: string = request.headers.authorization.split(' ')[1];

    const userId = await this.jwtUtility.extractUserIdFromToken(token);
    if (!userId) throw new UnauthorizedException();

    const user = await this.dataSource.query(
      `
    SELECT "UserId" as "userId", "Login" as "login"
    FROM public."Users"
    WHERE "UserId" = $1`,
      [userId],
    );

    if (!user) throw new UnauthorizedException();

    request.user = user;

    return true;
  }
}
