import { IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  password: string;

  @IsString()
  loginOrEmail: string;
}
