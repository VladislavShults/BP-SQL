import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const url = request.url;
    const ip = request.ip;

    const inputCountArray: [{ count: number }] = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."IpRestriction"
    WHERE "URL" = $1 AND "CurrentIp" = $2 AND "EntryTime" > current_timestamp - interval '10 seconds'`,
      [url, ip],
    );

    if (inputCountArray[0].count >= 5)
      throw new HttpException('ip-restriction', HttpStatus.TOO_MANY_REQUESTS);

    await this.dataSource.query(
      `
    INSERT INTO public."IpRestriction"(
    "URL", "CurrentIp", "EntryTime")
    VALUES ($1, $2, $3);`,
      [url, ip, new Date()],
    );

    await this.dataSource.query(`
    DELETE FROM public."IpRestriction"
    WHERE "EntryTime" < current_timestamp - interval '10 seconds';`);

    return true;
  }
}
