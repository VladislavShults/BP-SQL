import { Validate } from 'class-validator';
import { BlogId } from '../../validation/blogId-validation';

export class URIParamBlogDto {
  @Validate(BlogId)
  blogId: string;
}
