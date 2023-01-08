import { IsString, Length, Validate } from 'class-validator';
import { LikeOrDislike } from '../../../likes/validation/LikeOrDislikeValidation';

export class LikeStatusPostDto {
  @IsString()
  @Length(4, 9)
  @Validate(LikeOrDislike)
  likeStatus: 'Like' | 'Dislike' | 'None';
}
