import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { UnprocessableEntityError } from '../shared/utils/custom_error';
import { INotification } from './notification.model';

// Mock the NotificationRepository
jest.mock('./notification.repository');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    // Create a mock instance of NotificationRepository
    mockNotificationRepository = new NotificationRepository() as jest.Mocked<NotificationRepository>;

    // Initialize the NotificationService with the mocked repository
    notificationService = new NotificationService(mockNotificationRepository);
  });

  describe('sendUserNotification method to create a notification', () => {
    it('should successfully send a notification', async () => {
      const userId = 'user123';
      const message = 'You have a new message!';
      const type = 'info';

      const mockNotification: INotification = { userId, message, type, _id: '1' } as INotification;

      // Mock the repository's create method to return a mock notification
      mockNotificationRepository.create.mockResolvedValue(mockNotification);

      const notification = await notificationService.sendUserNotification(userId, message, type);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith({ userId, message, type });
      expect(notification).toEqual(mockNotification);
    });

    it('should throw an error if notification creation fails', async () => {
      const userId = 'user123';
      const message = 'You have a new message!';
      const type = 'info';

      // Mock the repository's create method to return null, simulating failure
      // mockNotificationRepository.create.mockResolvedValue(null);

      await expect(notificationService.sendUserNotification(userId, message, type))
        .rejects
        .toThrow(new UnprocessableEntityError('Failed to send notification'));
    });
  });

  describe('getUserNotification', () => {
    it('should successfully fetch a notification by ID', async () => {
      const notificationId = '1';
      const mockNotification = { _id: notificationId, message: 'You have a new message!', userId: 'user123' } as INotification;

      // Mock the repository's findOne method to return a mock notification
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);

      const notification = await notificationService.getUserNotification(notificationId);

      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({ _id: notificationId });
      expect(notification).toEqual(mockNotification);
    });

    it('should throw an error if notification not found', async () => {
      const notificationId = '1';

      // Mock the repository's findOne method to return null, simulating failure
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(notificationService.getUserNotification(notificationId))
        .rejects
        .toThrowError(new UnprocessableEntityError('Failed get notification'));
    });
  });

  describe('getUserNotifications', () => {
    it('should successfully fetch all notifications for a user', async () => {
      const userId = 'user123';
      const mockNotifications = [
        { userId, message: 'First notification', type: 'info', _id: '1' },
        { userId, message: 'Second notification', type: 'warning', _id: '2' },
      ] as INotification[];

      // Mock the repository's findMany method to return an array of notifications
      mockNotificationRepository.findMany.mockResolvedValue(mockNotifications);

      const notifications = await notificationService.getUserNotifications(userId);

      expect(mockNotificationRepository.findMany).toHaveBeenCalledWith(userId);
      expect(notifications).toEqual(mockNotifications);
    });

    it('should throw an error if no notifications found', async () => {
      const userId = 'user123';

      // Mock the repository's findMany method to return empty, simulating failure
      mockNotificationRepository.findMany.mockResolvedValue([]);

      await expect(notificationService.getUserNotifications(userId))
        .rejects
        .toThrowError(new UnprocessableEntityError('Failed get notification'));
    });
  });

  describe('markNotificationAsRead', () => {
    it('should successfully mark a notification as read', async () => {
      const notificationId = '1';

      // Mock the repository's update method to return a successful result
      mockNotificationRepository.update.mockResolvedValue(null);

      const result = await notificationService.markNotificationAsRead(notificationId);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(notificationId, { isRead: true });
      expect(result).toBe(true);
    });

    it('should throw an error if marking notification as read fails', async () => {
      const notificationId = '1';

      // Mock the repository's update method to simulate failure
      mockNotificationRepository.update.mockResolvedValue(null);

      await expect(notificationService.markNotificationAsRead(notificationId))
        .rejects
        .toThrowError(new UnprocessableEntityError('Failed to mark notification as read'));
    });
  });
});
