import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { hashPassword, comparePasswords } from '../../shared/utils/password_hash';
import { BadRequestError, NotFoundError, APIError } from '../../shared/utils/custom_error';
import { IUser } from './user.model';

jest.mock('./user.repository');
jest.mock('../../common/utils/password_hash');

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepo = userRepositoryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw an error if user already exists', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue({} as IUser);

      await expect(
        userService.createUser({ email: 'test@test.com', password: '1234' } as IUser),
      ).rejects.toThrow(BadRequestError);

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should create a new user', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashed_password',
      } as IUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');

      const result = await userService.createUser({
        email: 'test@test.com',
        password: '1234',
      } as IUser);

      expect(hashPassword).toHaveBeenCalledWith('1234');
      expect(userRepositoryMock.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashed_password',
      });
      expect(result).toEqual({ email: 'test@test.com', password: 'hashed_password' });
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(
        userService.login({ email: 'test@test.com', password: '1234' } as IUser),
      ).rejects.toThrow(NotFoundError);

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw an error if passwords do not match', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashed_password',
      } as IUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.login({ email: 'test@test.com', password: '1234' } as IUser),
      ).rejects.toThrow(BadRequestError);

      expect(comparePasswords).toHaveBeenCalledWith('1234', 'hashed_password');
    });

    it('should return the user if login is successful', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashed_password',
      } as IUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await userService.login({ email: 'test@test.com', password: '1234' } as IUser);

      expect(comparePasswords).toHaveBeenCalledWith('1234', 'hashed_password');
      expect(result).toEqual({ email: 'test@test.com', password: 'hashed_password' });
    });
  });

  describe('getUser', () => {
    it('should throw an error if user is not found', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(userService.getUser('userId')).rejects.toThrow(NotFoundError);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith('userId');
    });

    it('should return the user if found', async () => {
      userRepositoryMock.findById.mockResolvedValue({ email: 'test@test.com' } as IUser);

      const result = await userService.getUser('userId');

      expect(userRepositoryMock.findById).toHaveBeenCalledWith('userId');
      expect(result).toEqual({ email: 'test@test.com' });
    });
  });

  describe('updateUser', () => {
    it('should throw an error if update fails', async () => {
      userRepositoryMock.update.mockResolvedValue(null);

      await expect(userService.updateUser('userId', { email: 'test@test.com' })).rejects.toThrow(
        APIError,
      );

      expect(userRepositoryMock.update).toHaveBeenCalledWith('userId', { email: 'test@test.com' });
    });

    it('should return the updated user', async () => {
      userRepositoryMock.update.mockResolvedValue({ email: 'test@test.com' } as IUser);

      const result = await userService.updateUser('userId', { email: 'test@test.com' });

      expect(userRepositoryMock.update).toHaveBeenCalledWith('userId', { email: 'test@test.com' });
      expect(result).toEqual({ email: 'test@test.com' });
    });
  });
});
