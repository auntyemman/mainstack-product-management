import { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { authUser } from './auth';
import { NotAuthorizedError } from '../utils/custom_error';
import { verifyJWT } from '../utils/jwt.util';
import { createApp } from '../../app';

// Mock AuthenticationService.verifyJWT
jest.mock('../utils/jwt.util');

describe('authUser Middleware', () => {
  const app = createApp();

  // Route to test authUser
  app.get('/api/v1/users/me', authUser, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Access granted' });
  });

  // Middleware to catch errors
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof NotAuthorizedError) {
      return res.status(401).json({ error: 'Not authorized' }); // Ensure JSON is returned
    }
    next(err);
  });

  it('should allow access when a valid token is provided', async () => {
    const mockUser = { userId: '123', name: 'John Doe' };
    (verifyJWT as jest.Mock).mockResolvedValue(mockUser);

    await supertest(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer validToken')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'Access granted' });
      });

    expect(verifyJWT).toHaveBeenCalledWith('validToken');
  });

  it('should throw NotAuthorizedError when Authorization header is missing', async () => {
    await supertest(app)
      .get('/api/v1/users/me')
      .expect(401)
      .expect('Content-Type', /json/) // Expecting JSON here
      .expect((res) => {
        expect(res.body.error).toBe('Not authorized');
      });
  });

  it('should throw NotAuthorizedError when token is invalid', async () => {
    (verifyJWT as jest.Mock).mockImplementation(() => {
      throw new NotAuthorizedError();
    });

    await supertest(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer invalidToken')
      .expect(401)
      .expect('Content-Type', /json/) // Expecting JSON here
      .expect((res) => {
        expect(res.body.error).toBe('Not authorized');
      });

    expect(verifyJWT).toHaveBeenCalledWith('invalidToken');
  });

  it('should throw NotAuthorizedError when Authorization header is malformed', async () => {
    await supertest(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'InvalidHeader')
      .expect(401)
      .expect('Content-Type', /json/) // Expecting JSON here
      .expect((res) => {
        expect(res.body.error).toBe('Not authorized');
      });
  });
});
