import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '../configs/logger';
import { DatabaseConnectionError } from '../utils/custom_error';
import { environment } from '../utils/environment';

/**
 * Connects to the MongoDB database. If connection fails,
 * a DatabaseConnectionError will be thrown.
 * @returns {Promise<void>}
 */
export const databaseConnection = async () => {
  try {
    (await mongoose.connect(environment.database.db_uri)) as ConnectOptions;
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(`${error}`);
    throw new DatabaseConnectionError();
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error(`${error}`);
    throw new DatabaseConnectionError();
  }
};
