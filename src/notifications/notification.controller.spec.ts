import request from 'supertest';
import { Container } from 'inversify';
import { NotificationService } from './notification.service';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { createApp } from '../app';
import { Request, Response, NextFunction } from 'express';

describe('NotificationController Integration Test', () => {
  let container: Container;
  let notificationService: NotificationService;
  let app: any;

  beforeAll(async () => {
    // Initialize the container and services
    container = new Container();
    notificationService = { 
      getUserNotifications: jest.fn(),
      markNotificationAsRead: jest.fn(),
    } as unknown as NotificationService;

    // Bind the services to the container
    // container.bind(NOTIFICATION_TYPES.NotificationService).toConstantValue(notificationService);

    // Set up the app
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  describe('GET /', () => {
    it('should return user notifications successfully', async () => {
      const user = { _id: 'user123' }; // Mocked user data
      const notifications = [
        { id: '1', message: 'Welcome to the app!' },
        { id: '2', message: 'You have a new message.' }
      ];

      // Mock the notification service to return notifications
      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(notifications);

      // Mock authMiddleware to simulate a logged-in user
      app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.user = user;
        next();
      });

      const response = await request(app).get('/').set('Authorization', 'Bearer token');

      // Assert status and response
      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toEqual(notifications);
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(user._id.toString());
    });

    it('should handle errors and return 500 if notification service fails', async () => {
      const user = { _id: 'user123' }; // Mocked user data

      // Mock the notification service to throw an error
      (notificationService.getUserNotifications as jest.Mock).mockRejectedValue(new Error('Error fetching notifications'));

      // Mock authMiddleware to simulate a logged-in user
      app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.user = user;
        next();
      });

      const response = await request(app).get('/').set('Authorization', 'Bearer token');

      // Assert status and response
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });

  describe('PATCH /:notificationId', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = '1';
      const successResponse = { success: true };

      // Mock the notification service to mark as read
      (notificationService.markNotificationAsRead as jest.Mock).mockResolvedValue(successResponse);

      // Mock authMiddleware (assuming this is done elsewhere)
      app.use((req: Request, res: Response, next: NextFunction) => {
        next();
      });

      const response = await request(app).patch(`/${notificationId}`).set('Authorization', 'Bearer token');

      // Assert status and response
      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.success).toBe(true);
      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith(notificationId);
    });

    it('should handle errors and return 500 if marking notification as read fails', async () => {
      const notificationId = '1';

      // Mock the notification service to throw an error
      (notificationService.markNotificationAsRead as jest.Mock).mockRejectedValue(new Error('Error marking notification as read'));

      // Mock authMiddleware (assuming this is done elsewhere)
      app.use((req: Request, res: Response, next: NextFunction) => {
        next();
      });

      const response = await request(app).patch(`/${notificationId}`).set('Authorization', 'Bearer token');

      // Assert status and response
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });
});
