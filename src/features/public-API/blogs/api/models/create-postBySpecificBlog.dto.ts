import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreatePostBySpecificBlogDto {
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
}
