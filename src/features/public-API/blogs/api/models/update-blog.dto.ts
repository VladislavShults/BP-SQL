import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateBlogDto {
  @IsString()
  @Length(3, 15)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
