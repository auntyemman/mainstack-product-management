import mongoose from 'mongoose';
import { databaseConnection } from './database';
import { DatabaseConnectionError } from '../utils/custom_error';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Database Connection', () => {
  it('should connect to the database successfully', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce({});
    await expect(databaseConnection()).resolves.not.toThrow();
  });

  it('should throw DatabaseConnectionError on failure', async () => {
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
    await expect(databaseConnection()).rejects.toThrow(DatabaseConnectionError);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });
});
