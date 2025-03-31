import 'reflect-metadata';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { INotification } from './notification.model';
import { UnprocessableEntityError } from '../shared/utils/custom_error';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationRepositoryMock: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    notificationRepositoryMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepository>;

    notificationService = new NotificationService(notificationRepositoryMock);
  });

  it('should send a user notification successfully', async () => {
    const mockNotification: INotification = { userId: 'user123', message: 'Test message', type: 'test', isRead: false } as INotification;
    notificationRepositoryMock.create.mockResolvedValue(mockNotification);

    const result = await notificationService.sendUserNotification('user123', 'Test message', 'test');
    expect(result).toEqual(mockNotification);
    expect(notificationRepositoryMock.create).toHaveBeenCalledWith({ userId: 'user123', message: 'Test message', type: 'test' });
  });

  it('should throw an error if notification creation fails', async () => {
    notificationRepositoryMock.create.mockRejectedValue(new UnprocessableEntityError('Failed to send notification'));
    await expect(notificationService.sendUserNotification('user123', 'Test message', 'test'))
      .rejects.toThrow(UnprocessableEntityError);
  });

  it('should get a user notification successfully', async () => {
    const mockNotification: INotification = { userId: 'user123', message: 'Test message', type: 'test', isRead: false } as INotification;
    notificationRepositoryMock.findOne.mockResolvedValue(mockNotification);

    const result = await notificationService.getUserNotification('notif1');
    expect(result).toEqual(mockNotification);
    expect(notificationRepositoryMock.findOne).toHaveBeenCalledWith({ _id: 'notif1' });
  });

  it('should throw an error if user notification is not found', async () => {
    notificationRepositoryMock.findOne.mockResolvedValue(null);
    await expect(notificationService.getUserNotification('notif1'))
      .rejects.toThrow(UnprocessableEntityError);
  });

  it('should get multiple user notifications successfully', async () => {
    const mockNotifications: INotification[] = [
      { userId: 'user123', message: 'Message 1', type: 'info', isRead: false },
      { userId: 'user123', message: 'Message 2', type: 'alert', isRead: true }
    ] as INotification[];
    notificationRepositoryMock.findMany.mockResolvedValue(mockNotifications);

    const result = await notificationService.getUserNotifications('user123');
    expect(result).toEqual(mockNotifications);
    expect(notificationRepositoryMock.findMany).toHaveBeenCalledWith('user123');
  });

  it('should throw an error if no notifications are found', async () => {
    notificationRepositoryMock.findMany.mockRejectedValue(new UnprocessableEntityError('Failed get notification'));
    await expect(notificationService.getUserNotifications('user123'))
      .rejects.toThrow(UnprocessableEntityError);
  });

  it('should mark a notification as read successfully', async () => {
    const mockNotification: INotification = { userId: 'user123', message: 'Test message', type: 'test', isRead: true } as INotification;
    notificationRepositoryMock.update.mockResolvedValue(mockNotification);

    const result = await notificationService.markNotificationAsRead('notif1');
    expect(result).toEqual(mockNotification);
    expect(notificationRepositoryMock.update).toHaveBeenCalledWith('notif1', { isRead: true });
  });

  it('should throw an error if marking notification as read fails', async () => {
    notificationRepositoryMock.update.mockResolvedValue(null);
    await expect(notificationService.markNotificationAsRead('notif1'))
      .rejects.toThrow(UnprocessableEntityError);
  });
});


// import 'reflect-metadata';
// import { NotificationService } from './notification.service';
// import { NotificationRepository } from './notification.repository';
// import { NOTIFICATION_TYPES } from './di/notification.di';
// import { UnprocessableEntityError } from '../shared/utils/custom_error';
// import { INotification } from './notification.model';
// import { Container } from 'inversify';

// jest.mock('./notification.repository');

// describe('NotificationService', () => {
//   let notificationService: NotificationService;
//   let notificationRepositoryMock: jest.Mocked<NotificationRepository>;

//   beforeEach(() => {
//     const container = new Container();
//     notificationRepositoryMock = new NotificationRepository() as jest.Mocked<NotificationRepository>;
//     container.bind(NOTIFICATION_TYPES.NotificationRepository).toConstantValue(notificationRepositoryMock);
//     notificationService = container.get(NotificationService);
//   });
//   });

//   it('should send a user notification successfully', async () => {
//     const mockNotification: INotification = {
//       userId: 'user123',
//       message: 'Test message',
//       type: 'test',
//       isRead: false,
//       createdAt: new Date(),
//     } as INotification;
//     NotificationRepository.create.mockResolvedValue(mockNotification);
    
//     const result = await notificationService.sendUserNotification('user123', 'Test message', 'test');
//     expect(result).toEqual(mockNotification);
//   });

//   it('should throw an error if notification creation fails', async () => {
//     notificationRepositoryMock.create.mockRejectedValue(new UnprocessableEntityError('Failed to send notification'));
    
//     await expect(notificationService.sendUserNotification('user123', 'Test message', 'test'))
//       .rejects.toThrow(UnprocessableEntityError);
//   });

//   it('should get a user notification successfully', async () => {
//     const mockNotification: INotification = {
//       userId: 'user123',
//       message: 'Test message',
//       type: 'test',
//       isRead: false,
//       createdAt: new Date(),
//     } as INotification;
//     notificationRepositoryMock.findOne.mockResolvedValue(mockNotification);
    
//     const result = await notificationService.getUserNotification('notif1');
//     expect(result).toEqual(mockNotification);
//   });

//   it('should throw an error if user notification is not found', async () => {
//     notificationRepositoryMock.findOne.mockRejectedValue(new UnprocessableEntityError('Failed to get notification'));
    
//     await expect(notificationService.getUserNotification('notif1'))
//       .rejects.toThrow(UnprocessableEntityError);
//   });

//   it('should get multiple user notifications successfully', async () => {
//     const mockNotifications: INotification[] = [
//       {
//         userId: 'user123',
//         message: 'Test message',
//         type: 'test',
//         isRead: false,
//         createdAt: new Date(),
//       },
//     ] as INotification[];
//     notificationRepositoryMock.findMany.mockResolvedValue(mockNotifications);
    
//     const result = await notificationService.getUserNotifications('user123');
//     expect(result).toEqual(mockNotifications);
//   });

//   it('should throw an error if no notifications are found', async () => {
//     notificationRepositoryMock.findMany.mockRejectedValue(new UnprocessableEntityError('Failed to get notification'));
    
//     await expect(notificationService.getUserNotifications('user123'))
//       .rejects.toThrow(UnprocessableEntityError);
//   });

//   it('should mark a notification as read successfully', async () => {
//     const updatedNotification: INotification = {
//       userId: 'user123',
//       message: 'Test message',
//       type: 'test',
//       isRead: true,
//       createdAt: new Date(),
//     } as INotification;
//     notificationRepositoryMock.update.mockResolvedValue(updatedNotification);
    
//     const result = await notificationService.markNotificationAsRead('notif1');
//     expect(result).toEqual(updatedNotification);
//   });

//   it('should throw an error if marking notification as read fails', async () => {
//     notificationRepositoryMock.update.mockRejectedValue(new UnprocessableEntityError('Failed to mark notification as read'));
    
//     await expect(notificationService.markNotificationAsRead('notif1'))
//       .rejects.toThrow(UnprocessableEntityError);
//   });
// });
