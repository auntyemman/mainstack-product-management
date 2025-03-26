import winston from 'winston';
import { NODE_ENV } from '.';

// Configure Winston logger to log to a file
export const logger = winston.createLogger({
  transports: new winston.transports.File({ filename: 'error.log', level: 'error' }),
});

// log to terminal if not in production
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}
