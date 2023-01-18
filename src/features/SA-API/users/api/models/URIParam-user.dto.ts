import { IsString } from 'class-validator';

export class URIParamUserDto {
  @IsString()
  userId: string;
}
