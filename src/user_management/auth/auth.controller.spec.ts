import { AuthController } from '../../user_management/auth/auth.controller';
import { AuthenticationService } from '../../user_management/auth/auth.service';
import { AUTH_TYPES } from '../../user_management/auth/di/auth.di';
import { validateRequest } from '../../shared/utils/request_validator';
import { successResponse } from '../../shared/utils/api_response';
import { SignUpDTO, SignInDTO } from '../../user_management/users/user.dto';
import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';

jest.mock('../../shared/utils/request_validator');

const mockAuthService = {
  createUser: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController Unit Tests', () => {
  let authController: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    const container = new Container();
    container.bind(AUTH_TYPES.AuthService).toConstantValue(mockAuthService as unknown as AuthenticationService);
    authController = new AuthController(container.get(AUTH_TYPES.AuthService));

    req = { body: {}, cookies: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      };
      req.body = mockUser;

      (validateRequest as jest.Mock).mockResolvedValue(mockUser);
      mockAuthService.createUser.mockResolvedValue(mockUser);

      await authController.signUp(req as Request, res as Response, next);

      expect(validateRequest).toHaveBeenCalledWith(SignUpDTO, mockUser);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(mockUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(successResponse(201, 'User registered successfully', mockUser));
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const mockUser = { email: 'test@example.com', password: 'password123' };
      req.body = mockUser;

      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn(), // Ensure this is mocked
      };
      
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (validateRequest as jest.Mock).mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockTokens);

      await authController.login(req as Request, res as Response, next);

      expect(validateRequest).toHaveBeenCalledWith(SignInDTO, mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(successResponse(201, 'User logged in successfully', mockTokens));
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      req.cookies = { refreshToken: 'mock-refresh-token' };
      const mockNewAccessToken = 'new-access-token';
      mockAuthService.refreshToken.mockResolvedValue(mockNewAccessToken);

      await authController.refreshToken(req as Request, res as Response, next);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('mock-refresh-token');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(successResponse(201, 'New access token generated', { accessToken: mockNewAccessToken }));
    });
  });
});



// import request from 'supertest';
// import { createApp } from '../../app';
// import { databaseConnection, disconnectDatabase } from '../../shared/database/database';
// import { AUTH_TYPES } from '../../user_management/auth/di/auth.di';
// import { authContainer } from '../../user_management/auth/di/auth.container';
// import { AuthenticationService } from '../../user_management/auth/auth.service';
// import { Request, Response, NextFunction } from 'express';

// // Mock User Repository and Container (similar to previous fixes)
// const mockUserRepository = {
//   findById: jest.fn().mockResolvedValue({ _id: 'userId', role: 'user' }),
//   findOne: jest.fn().mockResolvedValue({ _id: 'userId', role: 'user' })
// };

// const mockUserContainer = {
//   get: jest.fn().mockReturnValue(mockUserRepository)
// };

// const USER_TYPES = {
//   UserRepository: 'UserRepository'
// };

// // Mock container
// jest.mock('../../user_management/auth/di/auth.container', () => ({
//   userContainer: mockUserContainer,
//   USER_TYPES
// }));

// // Mock auth middleware if needed for other routes
// jest.mock('../../shared/middlewares/auth', () => ({
//   authUser: () => (req: Request, res: Response, next: NextFunction) => {
//     res.locals.user = { id: 'userId', role: 'user' };
//     next();
//   }
// }));

// // Mock AuthenticationService
// jest.mock('../../user_management/auth/auth.service');

// describe('AuthController Integration Tests', () => {
//   let app: any;
//   let authService: AuthenticationService;

//   beforeAll(async () => {
//     await databaseConnection();
//     app = createApp();
//     authService = authContainer.get<AuthenticationService>(AUTH_TYPES.AuthService);
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   afterAll(async () => {
//     await disconnectDatabase();
//   });

//   describe('POST /api/v1/auth/signup', () => {
//     it('should register a user successfully', async () => {
//       const mockUser = { 
//         email: 'test@example.com', 
//         password: 'password123',
//         firstName: 'Test',
//         lastName: 'User',
//         username: 'testuser'
//       };
      
//       // Mock the service implementation
//       (authService.createUser as jest.Mock) = jest.fn().mockResolvedValue({ 
//         id: '123', 
//         email: mockUser.email,
//         firstName: mockUser.firstName,
//         lastName: mockUser.lastName,
//         username: mockUser.username
//       });

//       const res = await request(app)
//         .post('/api/v1/auth/signup')
//         .send(mockUser);

//       expect(res.status).toBe(201);
//       expect(res.body.message).toBe('User registered successfully');
//       expect(authService.createUser).toHaveBeenCalledWith(expect.objectContaining({
//         email: mockUser.email,
//         password: mockUser.password
//       }));
//     });
//   });

//   describe('POST /api/v1/auth/login', () => {
//     it('should log in a user successfully', async () => {
//       const mockUser = { email: 'test@example.com', password: 'password123' };
//       const mockTokens = { 
//         accessToken: 'access-token', 
//         refreshToken: 'refresh-token',
//         user: { id: '123', email: 'test@example.com', role: 'user' }
//       };
      
//       // Mock the service implementation
//       (authService.login as jest.Mock) = jest.fn().mockResolvedValue(mockTokens);

//       const res = await request(app)
//         .post('/api/v1/auth/login')
//         .send(mockUser);

//       expect(res.status).toBe(201);
//       expect(res.body.message).toBe('User logged in successfully');
//       expect(res.body.data).toEqual(mockTokens);
//       expect(authService.login).toHaveBeenCalledWith(expect.objectContaining({
//         email: mockUser.email,
//         password: mockUser.password
//       }));
//     });
//   });

//   describe('GET /api/v1/auth/refresh', () => {
//     it('should refresh access token successfully', async () => {
//       const mockNewAccessToken = 'new-access-token';
      
//       // Ensure the mock returns an object with accessToken property
//       (authService.refreshToken as jest.Mock) = jest.fn().mockResolvedValue({
//         accessToken: mockNewAccessToken
//       });

//       const res = await request(app)
//         .get('/api/v1/auth/refresh')
//         .set('Cookie', ['refreshToken=mock-refresh-token']);

//       expect(res.status).toBe(201);
//       expect(res.body.message).toBe('New access token generated');
//       expect(res.body.data.accessToken).toBe(mockNewAccessToken);
//       expect(authService.refreshToken).toHaveBeenCalledWith('mock-refresh-token');
//     });
//   });
// });