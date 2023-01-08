import { IsString } from 'class-validator';

export class RegistrationConfirmationAuthDto {
  @IsString()
  code: string;
}
