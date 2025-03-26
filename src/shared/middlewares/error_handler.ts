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

/**
 * Global error handler middleware.
 *
 * Handles the following custom errors:
 *  - {@link CustomError}
 *  - {@link BadRequestError}
 *  - {@link RequestValidationError}
 *  - {@link NotFoundError}
 *  - {@link APIError}
 *  - {@link DatabaseConnectionError}
 *  - {@link NotAuthorizedError}
 *
 * Otherwise, logs the error to the file and sends a generic error response
 * to the client.
 *
 * @param {Error} err - The error to be handled.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next function.
 * @returns {Response} - The response object.
 */

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
    logger.error(`${req.originalUrl} - ${req.method} - ${req.ip} - ${err.message}`);

    // Send a generic error response to the client
    return res.status(400).send({
      errors: [{ message: err.message }],
    });
  }
};
