import { IsEmail } from 'class-validator';

export class EmailAuthDto {
  @IsEmail()
  email: string;
}
