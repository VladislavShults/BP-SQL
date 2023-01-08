import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @Length(3, 15)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsString()
  @Length(3, 500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
