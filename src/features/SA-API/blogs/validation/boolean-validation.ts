import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBoolean', async: false })
export class CustomIsBooleanValidator implements ValidatorConstraintInterface {
  validate(banned: boolean, args: ValidationArguments) {
    return banned === true || banned === false; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'isBanned';
  }
}
