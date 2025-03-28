import { Request, Response, NextFunction } from 'express';
import {
  CustomError,
  BadRequestError,
  RequestValidationError,
  NotFoundError,
  APIError,
  DatabaseConnectionError,
  NotAuthorizedError,
} from '../utils/custom_error';
import { logger } from '../configs/logger';


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof APIError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  if (err instanceof NotAuthorizedError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  } else {
    // Log the error that was not caught to the file
    console.log(err);
    logger.error(`${req.originalUrl} - ${req.method} - ${req.ip} - ${err.message}`);

    // Send a generic error response that is not handled to the client
    return res.status(500).send({
      errors: [{ message: err.message }],
    });
  }
};
