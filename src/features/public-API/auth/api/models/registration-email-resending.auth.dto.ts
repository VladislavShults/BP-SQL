import { IsEmail } from 'class-validator';

export class RegistrationEmailResendingAuthDto {
  @IsEmail()
  email: string;
}
