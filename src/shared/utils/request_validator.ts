import { validate } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { RequestValidationError } from './custom_error';

/**
 * Validate a request object against a given DTO type.
 *
 * It takes a typeDTO as the first argument, which is the type of the DTO
 * that the request object should be validated against. The second argument
 * is the request object itself.
 *
 * If the request object is valid against the given DTO type, this function
 * returns the validated object. If there are any errors, this function
 * returns a rejected promise with a RequestValidationError.
 *
 * @param typeDTO The type of the DTO that the request object should be
 * validated against.
 * @param request The request object itself.
 *
 * @returns A promise that resolves with the validated object if the
 * request object is valid, or rejects with a RequestValidationError if
 * there are any errors.
 **/
export const validateRequest = async (typeDTO: ClassConstructor<any>, request: any) => {
  const dto = plainToClass(typeDTO, request);

  const errors = await validate(
    dto,
    { whitelist: true, forbidNonWhitelisted: true },
    { validationError: { target: true } },
  );
  if (errors.length > 0) {
    const rejectedError = Promise.reject(new RequestValidationError(errors));
    return rejectedError;
  }
  return dto;
};
