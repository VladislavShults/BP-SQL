import { IsBoolean, IsString, Length } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Length(20, 150)
  banReason: string;
}
