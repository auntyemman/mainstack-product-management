import request from 'supertest';
import { createApp } from '../../app';
import { userContainer } from './di/user.container';
import { USER_TYPES } from './di/user.types';
import { UserService } from './user.service';

// Mock UserService to isolate controller logic and avoid DB hits
jest.mock('./user.service');

// Express app instance
const app = createApp();

// Get the mock instance of UserService injected into the controller
const userService = userContainer.get<UserService>(USER_TYPES.UserService);

describe('UserController Integration Tests', () => {
  // Test for "GET /api/v1/user/me" (getProfile)
  describe('GET /me', () => {
    it('should return the logged-in user profile', async () => {
      const mockUser = { _id: '123', email: 'test@example.com', firstName: 'Foo' };
      // Mock the service method used inside the controller
      userService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Simulate the user being in session (could also mock res.locals.user if needed)
      const res = await request(app)
        .get('/api/v1/user/me')
        .set('Authorization', 'Bearer mock-token'); // assuming token-based auth

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('profile in session fetched successfully');
      expect(res.body.data).toEqual(mockUser);
    });
  });

  // Test for "GET /api/v1/user/:id" (getUser)
  describe('GET /:id', () => {
    it('should fetch a specific user by ID', async () => {
      const mockUser = { _id: '123', email: 'test@example.com', firstName: 'Foo' };
      const userId = '123';
      userService.getUser = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app)
        .get(`/api/v1/user/${userId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User fetched successfully');
      expect(res.body.data).toEqual(mockUser);
    });
  });

  // Test for "PATCH /api/v1/user/:id" (makeAdmin)
  describe('PATCH /:id', () => {
    it('should make a user an admin successfully', async () => {
      const userId = '123';
      const mockAdminUser = { _id: userId, email: 'test@example.com', role: 'admin' };

      userService.makeAdmin = jest.fn().mockResolvedValue(mockAdminUser);

      const res = await request(app)
        .patch(`/api/v1/user/${userId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User made an admin successfully');
      expect(res.body.data).toEqual(mockAdminUser);
    });
  });

  // Test for "DELETE /api/v1/user/logout" (logout)
  describe('DELETE /logout', () => {
    it('should log out the user successfully', async () => {
      const res = await request(app)
        .delete('/api/v1/user/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  // Test for "PUT /api/v1/user/:id" (updateProfile)
  describe('PUT /:id', () => {
    it('should update the user profile successfully', async () => {
      const updatedData = { firstName: 'Updated User' };
      const updatedUser = { _id: '123', email: 'test@example.com', ...updatedData };

      userService.updateUser = jest.fn().mockResolvedValue(updatedUser);

      const res = await request(app)
        .put(`/api/v1/user/${updatedUser._id}`)
        .set('Authorization', 'Bearer mock-token')
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.data).toEqual(updatedUser);
    });
  });

  // Additional tests could be written for the other routes like generating keys, etc.
});
