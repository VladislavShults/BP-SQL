import { IsString, Length } from 'class-validator';

export class NewPasswordAuthDto {
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
