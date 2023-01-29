import { IsBoolean, IsString, Length } from 'class-validator';

export class BanUserForBlogDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Length(20, 150)
  banReason: string;

  @IsString()
  blogId: string;
}
