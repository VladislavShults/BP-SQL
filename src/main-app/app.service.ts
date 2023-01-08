import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'The BEST bloggers platform for developer !!!';
  }
}
