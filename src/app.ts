import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { errorHandler } from './shared/middlewares/error_handler';
import { router } from '.';
import { GlobalValidationMiddleware } from './shared/middlewares/dto_validation';

/**
 * Creates an Express application with the default middlewares
 * and the routes at /api/v1.
 * @returns {Application} The Express application.
 */
export function createApp(): Application {
  const app = express();

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  // Apply Global Validation Middleware
  app.use(GlobalValidationMiddleware);
  app.use('/api/v1', router);
  app.get('/', (req: Request, res: Response) => {
    return res.status(200).send('Hello, Mainstack!.');
  });
  app.use(errorHandler);

  return app;
}
