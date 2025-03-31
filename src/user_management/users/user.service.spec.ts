import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { IUser } from './user.model';
import { NotFoundError, UnprocessableEntityError } from '../../shared/utils/custom_error';
import { UserRole } from './user.dto';

// Mock the UserRepository to avoid actual database interactions
const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

// Initialize the UserService with the mocked repository
const userService = new UserService(mockUserRepo as unknown as UserRepository);

describe('UserService', () => {
  let mockUser: Partial<IUser>;

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    jest.clearAllMocks();

    // Define a sample user object
    mockUser = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'hashedpassword',
      role: UserRole.user,
    };
  });

  // Test: Fetching a user by ID
  describe('getUser', () => {
    it('should return a user when found', async () => {
      // Mock findById to return a user
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Call getUser
      const result = await userService.getUser(mockUser.id);

      // Expect the returned user to match
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      // Mock findById to return null (user not found)
      mockUserRepo.findById.mockResolvedValue(null);

      // Expect the function to throw a NotFoundError
      await expect(userService.getUser('non-existent-id')).rejects.toThrow(NotFoundError);
      expect(mockUserRepo.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  // Test: Updating a user
  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      // Mock update to return the updated user
      const updatedUser = { ...mockUser, firstName: 'Foo' };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      // Call updateUser
      const result = await userService.updateUser(mockUser.id, { firstName: 'Foo' });

      // Expect the returned user to have the updated firstName
      expect(result).toEqual(updatedUser);
      expect(mockUserRepo.update).toHaveBeenCalledWith(mockUser.id, { firstName: 'Foo' });
    });

    it('should throw UnprocessableEntityError if update fails', async () => {
      // Mock update to return null (update failure)
      mockUserRepo.update.mockResolvedValue(null);

      // Expect the function to throw an UnprocessableEntityError
      await expect(userService.updateUser(mockUser.id, { firstName: 'Foo' })).rejects.toThrow(
        UnprocessableEntityError,
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(mockUser.id, { firstName: 'Foo' });
    });
  });

  // Test: Promoting a user to admin
  describe('makeAdmin', () => {
    it('should update user role to admin', async () => {
      // Mock getUser to return a user
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Mock update to return user with updated role
      const updatedUser = { ...mockUser, role: UserRole.admin };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      // Call makeAdmin
      const result = await userService.makeAdmin(mockUser.id);

      // Expect the user's role to be updated to admin
      expect(result.role).toBe(UserRole.admin);
      expect(mockUserRepo.update).toHaveBeenCalledWith(mockUser.id, { role: UserRole.admin });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      // Mock getUser to return null (user not found)
      mockUserRepo.findById.mockResolvedValue(null);

      // Expect the function to throw a NotFoundError
      await expect(userService.makeAdmin('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
