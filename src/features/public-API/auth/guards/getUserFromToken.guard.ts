import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../../infrastructure/JWT-utility/jwt-service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GetUserFromToken implements CanActivate {
  constructor(
    private readonly jwtUtility: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) return true;

    const token: string = request.headers.authorization.split(' ')[1];

    const userId = await this.jwtUtility.extractUserIdFromToken(token);
    if (!userId) return true;

    const user = await this.dataSource.query(
      `
    SELECT "UserId" as "id", "Login" as "login", "IsBanned" as "isBanned"
    FROM public."Users"
    WHERE "UserId" = $1`,
      [userId],
    );

    if (user.length === 0) return true;

    request.user = user;

    return true;
  }
}
