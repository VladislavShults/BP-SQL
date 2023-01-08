import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const auth = { login: 'admin', password: 'qwerty' };

    const b64auth = (request.headers.authorization || '').split(' ')[1] || '';
    const b64authType =
      (request.headers.authorization || '').split(' ')[0] || '';
    const [login, password] = Buffer.from(b64auth, 'base64')
      .toString()
      .split(':');

    if (
      login &&
      password &&
      login === auth.login &&
      password === auth.password &&
      b64authType === 'Basic'
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
