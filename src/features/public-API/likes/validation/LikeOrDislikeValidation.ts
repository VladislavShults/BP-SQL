import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class LikeOrDislike implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return text === 'Like' || text === 'Dislike' || text === 'None';
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return '($value) !';
  }
}
