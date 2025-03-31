import 'reflect-metadata';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { successResponse } from '../shared/utils/api_response';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'inversify';

jest.mock('../shared/utils/api_response');

describe('NotificationController', () => {
  let notificationController: NotificationController;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    notificationServiceMock = {
      getUserNotifications: jest.fn(),
      markNotificationAsRead: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    const container = new Container();
    container.bind(NOTIFICATION_TYPES.NotificationService).toConstantValue(notificationServiceMock);

    notificationController = new NotificationController(notificationServiceMock);

    req = {};
    res = {
      locals: { user: { _id: 'user123' } },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications successfully', async () => {
      const mockNotifications = [{ id: 'notif1', message: 'New message' }];
      (notificationServiceMock.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (successResponse as jest.Mock).mockReturnValue({ statusCode: 200, data: mockNotifications });

      await notificationController.getUserNotifications(req as Request, res as Response, next);

      expect(notificationServiceMock.getUserNotifications).toHaveBeenCalledWith('user123');
      expect(successResponse).toHaveBeenCalledWith(200, 'User notifications fetched successfully', mockNotifications);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ statusCode: 200, data: mockNotifications });
    });

    it('should pass errors to next if service fails', async () => {
      const error = new Error('Service error');
      (notificationServiceMock.getUserNotifications as jest.Mock).mockRejectedValue(error);

      await notificationController.getUserNotifications(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('markNotificationAsRead', () => {
    beforeEach(() => {
      req = { params: { notificationId: 'notif1' } };
    });

    it('should mark a notification as read successfully', async () => {
      (notificationServiceMock.markNotificationAsRead as jest.Mock).mockResolvedValue(true);
      (successResponse as jest.Mock).mockReturnValue({ statusCode: 200, data: { success: true } });

      await notificationController.markNotificationAsRead(req as Request, res as Response, next);

      expect(notificationServiceMock.markNotificationAsRead).toHaveBeenCalledWith('notif1');
      expect(successResponse).toHaveBeenCalledWith(200, 'Notification marked as read', { success: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ statusCode: 200, data: { success: true } });
    });

    it('should pass errors to next if service fails', async () => {
      const error = new Error('Service failure');
      (notificationServiceMock.markNotificationAsRead as jest.Mock).mockRejectedValue(error);

      await notificationController.markNotificationAsRead(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
