import request from 'supertest';
import { createApp } from '../../app';
import { databaseConnection, disconnectDatabase } from '../../shared/database/database';
import { AUTH_TYPES } from '../../user_management/auth/di/auth.di';
import { authContainer } from '../../user_management/auth/di/auth.container';
import { AuthenticationService } from '../../user_management/auth/auth.service';

// Mock AuthenticationService to avoid hitting the real database
jest.mock('../../user_management/auth/auth.service');

// express app component
const app = createApp();
const authService = authContainer.get<AuthenticationService>(AUTH_TYPES.AuthService);

describe('AuthController Integration Tests', () => {
  beforeAll(async () => {
    await databaseConnection();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a user successfully', async () => {
      const mockUser = { email: 'test@example.com', password: 'password123' };
      authService.createUser = jest.fn().mockResolvedValue({ id: '123', ...mockUser });

      const res = await request(app).post('/api/v1/auth/signup').send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(authService.createUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in a user successfully', async () => {
      const mockUser = { email: 'test@example.com', password: 'password123' };
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
      authService.login = jest.fn().mockResolvedValue(mockTokens);

      const res = await request(app).post('/api/v1/auth/login').send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User logged in successfully');
      expect(res.body.data).toEqual(mockTokens);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('GET /api/v1/auth/refresh', () => {
    it('should refresh access token successfully', async () => {
      const mockNewAccessToken = 'new-access-token';
      authService.refreshToken = jest.fn().mockResolvedValue(mockNewAccessToken);

      const res = await request(app)
        .get('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=mock-refresh-token']);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('New access token generated');
      expect(res.body.data.accessToken).toBe(mockNewAccessToken);
      expect(authService.refreshToken).toHaveBeenCalledWith('mock-refresh-token');
    });
  });
});
