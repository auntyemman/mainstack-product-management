import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { validateRequest } from '../../shared/utils/request_validator';
import { SignUpDTO, SignInDTO, CreateAdminDTO, UpdateDTO } from './user.dto';
import { Request, Response, NextFunction } from 'express';
import { APIError } from '../../shared/utils/custom_error';
import { IUser } from './user.model';

jest.mock('./user.service');
jest.mock('../../user/authentication/authentication.service');
jest.mock('../../common/utils/request_validator');

describe('UserController', () => {
  let userController: UserController;
  let userServiceMock: jest.Mocked<UserService>;
  let authServiceMock: jest.Mocked<AuthenticationService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    userServiceMock = new UserService() as jest.Mocked<UserService>;
    authServiceMock = new AuthenticationService() as jest.Mocked<AuthenticationService>;

    // Ensure the createAccessToken method is mocked correctly
    authServiceMock.createAccessToken = jest.fn();

    userController = new UserController();
    (userController as any).userService = userServiceMock;
    (userController as any).authService = authServiceMock;

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        user: { user: { _id: 'userId' } },
      },
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a user and return status 201', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: 'password',
      });
      userServiceMock.createUser.mockResolvedValue({
        id: '234567',
        email: 'test@test.com',
      } as IUser);

      await userController.signUp(req as Request, res as Response, next);

      expect(validateRequest).toHaveBeenCalledWith(SignUpDTO, req.body);
      expect(userServiceMock.createUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Registration successful',
        data: { id: '234567', email: 'test@test.com' },
      });
    });

    it('should call next with an error if createUser fails', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: 'password',
      });
      userServiceMock.createUser.mockRejectedValue(new APIError('Failed to create user'));

      await userController.signUp(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new APIError('Failed to create user'));
    });
  });

  describe('createAdmin', () => {
    it('should create an admin user and return status 201', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'admin@test.com',
        password: 'password',
        role: 'admin',
      });
      userServiceMock.createUser.mockResolvedValue({
        id: 'adminId',
        email: 'admin@test.com',
      } as IUser);

      req.body = { email: 'admin@test.com', password: 'password' };

      await userController.createAdmin(req as Request, res as Response, next);

      expect(validateRequest).toHaveBeenCalledWith(CreateAdminDTO, { ...req.body, role: 'admin' });
      expect(userServiceMock.createUser).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password',
        role: 'admin',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Admin creation successful',
        data: { id: 'adminId', email: 'admin@test.com' },
      });
    });

    it('should call next with an error if createUser fails', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'admin@test.com',
        password: 'password',
        role: 'admin',
      });
      userServiceMock.createUser.mockRejectedValue(new APIError('Failed to create admin'));

      req.body = { email: 'admin@test.com', password: 'password' };

      await userController.createAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new APIError('Failed to create admin'));
    });
  });

  describe('login', () => {
    it('should login the user and return status 200', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: 'password',
      });
      userServiceMock.login.mockResolvedValue({ id: 'userId', email: 'test@test.com' } as IUser);
      authServiceMock.createAccessToken.mockReturnValue('access_token');

      req.body = { email: 'test@test.com', password: 'password' };

      await userController.login(req as Request, res as Response, next);

      expect(validateRequest).toHaveBeenCalledWith(SignInDTO, req.body);
      expect(userServiceMock.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(authServiceMock.createAccessToken).toHaveBeenCalledWith({
        user: { id: 'userId', email: 'test@test.com' },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Logged in successfully',
        data: { accessToken: 'access_token' },
      });
    });

    it('should call next with an error if login fails', async () => {
      (validateRequest as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: 'password',
      });
      userServiceMock.login.mockRejectedValue(new APIError('Login failed'));

      req.body = { email: 'test@test.com', password: 'password' };

      await userController.login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new APIError('Login failed'));
    });
  });

  // Add other method tests here like `getUser`, `getProfile`, `updateProfile`, etc.
});
