import { IsUUID } from 'class-validator';

export class RegistrationConfirmationAuthDto {
  @IsUUID()
  code: string;
}
