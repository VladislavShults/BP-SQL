import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BlogId } from '../../../blogs/validation/blogId-validation';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @Length(0, 30)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @IsString()
  @Length(0, 100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;

  @IsString()
  @Length(0, 1000)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;

  @IsString()
  @BlogId()
  blogId: string;
}
