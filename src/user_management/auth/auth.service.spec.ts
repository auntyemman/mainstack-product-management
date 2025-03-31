import 'reflect-metadata'; // Required for inversify.js dependency injection
import { AuthenticationService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { BadRequestError, NotFoundError } from '../../shared/utils/custom_error';
import { IUser } from '../users/user.model';
import { hashPassword, comparePasswords } from '../../shared/utils/password_hash';
import { createAccessToken, createRefreshToken, verifyJWT } from '../../shared/utils/jwt.util';

// Mock dependencies so they don't execute real implementations
jest.mock('../../shared/utils/password_hash');
jest.mock('../../shared/utils/jwt.util');

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let userRepoMock: jest.Mocked<UserRepository>;
  let emitterServiceMock: jest.Mocked<EmitterService>;

  beforeEach(() => {
    // Create mock implementations for UserRepository and EmitterService
    userRepoMock = {
      findByEmail: jest.fn(), // Mock function for finding a user by email
      create: jest.fn(), // Mock function for creating a user
    } as unknown as jest.Mocked<UserRepository>;

    emitterServiceMock = {
      emitAsync: jest.fn(), // Mock function for emitting events
    } as unknown as jest.Mocked<EmitterService>;

    // Instantiate the AuthenticationService with mocked dependencies
    authService = new AuthenticationService(userRepoMock, emitterServiceMock);
  });

  describe('createUser', () => {
    /**-------- main call ----------------- */
    it('should create a new user if email does not exist', async () => {
      // Simulate user data that will be passed
      const userData: IUser = {
        email: 'test@example.com',
        password: 'plainpassword',
      } as IUser;

      // Mock repository response: No user found with this email
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(null);

      // Mock password hashing function
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock repository response: Creating a user returns a new user object
      (userRepoMock.create as jest.Mock).mockResolvedValue({
        ...userData,
        id: '12345',
        password: 'hashedPassword',
      });

      // Execute the function
      const newUser = await authService.createUser(userData);

      // Verify correct methods were called with the right arguments
      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(hashPassword).toHaveBeenCalledWith('plainpassword');
      expect(userRepoMock.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashedPassword',
      });
      expect(emitterServiceMock.emitAsync).toHaveBeenCalledWith('userRegistered', '12345');
      expect(newUser).toEqual({
        email: 'test@example.com',
        password: 'hashedPassword',
        id: '12345',
      });
    });

    /**-------- code path ----------------- */
    it('should throw an error if the user already exists', async () => {
      // Mock response: User already exists
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      // Expect an error when calling createUser
      await expect(
        authService.createUser({ email: 'test@example.com', password: '12345' } as IUser),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('login', () => {
    it('should return tokens when login is successful', async () => {
      // Mock user data in the database
      const userData: IUser = {
        _id: '12345',
        email: 'test@example.com',
        password: 'hashedPassword',
      } as IUser;

      // Mock finding user in repository
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(userData);

      // Mock password comparison
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      (createAccessToken as jest.Mock).mockReturnValue('mockAccessToken');
      (createRefreshToken as jest.Mock).mockReturnValue('mockRefreshToken');

      // Execute the function
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      } as IUser);

      // Verify expected calls
      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(comparePasswords).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(createAccessToken).toHaveBeenCalledWith({ sub: '12345' });
      expect(createRefreshToken).toHaveBeenCalledWith({ sub: '12345' });
      expect(result).toEqual({ accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' });
    });

    /**-------- code paths ----------------- */
    it('should throw NotFoundError if user does not exist', async () => {
      // Mock finding user in repository
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(null);

      // Expect an error when calling login
      await expect(
        authService.login({ email: 'test@example.com', password: 'password' } as IUser),
      ).rejects.toThrow(NotFoundError);

      // Verify expected calls
      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw BadRequestError if password does not match', async () => {
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue({
        _id: '12345',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' } as IUser),
      ).rejects.toThrow(BadRequestError);

      // call the mocker password hashing util file
      expect(comparePasswords).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token if refresh token is valid', async () => {
      // Mock verification of JWT refresh token
      (verifyJWT as jest.Mock).mockResolvedValue({ decoded: { sub: '12345' } });

      // Mock generating a new access token
      (createAccessToken as jest.Mock).mockReturnValue('newAccessToken');

      // Execute the function
      const newAccessToken = await authService.refreshToken('validRefreshToken');

      // Verify method calls
      expect(verifyJWT).toHaveBeenCalledWith('validRefreshToken');
      expect(createAccessToken).toHaveBeenCalledWith({ sub: '12345' });
      expect(newAccessToken).toBe('newAccessToken');

      /**-------- code path ----------------- */
      it('should throw BadRequestError if refresh token is invalid', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue(null);

        await expect(authService.refreshToken('invalidRefreshToken')).rejects.toThrow(
          BadRequestError,
        );

        expect(verifyJWT).toHaveBeenCalledWith('invalidRefreshToken');
        expect(createAccessToken).not.toHaveBeenCalled();
      });
    });
  });
});
