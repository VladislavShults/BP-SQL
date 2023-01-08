import { IsBoolean, IsString, Length, Validate } from 'class-validator';
import { BlogId } from '../../../../public-API/blogs/validation/blogId-validation';

export class BanUserForBlogDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Length(20, 150)
  banReason: string;

  @IsString()
  blogId: string;
}
