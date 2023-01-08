import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BlogsQueryRepository } from '../api/blogs.query.repository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogIdValidation implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async validate(blogId: any, args: ValidationArguments) {
    return this.blogsQueryRepository.findBlogById(blogId).then((blog) => {
      return !!blog;
    });
  }
}

export function BlogId(validationOptions?: ValidationOptions) {
  return function (object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogIdValidation,
    });
  };
}
