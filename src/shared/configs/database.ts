import mongoose, { ConnectOptions } from 'mongoose';
import { DATABASE_URI } from '.';
import { logger } from './logger';
import { DatabaseConnectionError } from '../utils/custom_error';

/**
 * Connects to the MongoDB database. If connection fails,
 * a DatabaseConnectionError will be thrown.
 * @returns {Promise<void>}
 */
export const databaseConnection = async () => {
  try {
    (await mongoose.connect(DATABASE_URI)) as ConnectOptions;
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(`${error}`);
    throw new DatabaseConnectionError();
  }
};
