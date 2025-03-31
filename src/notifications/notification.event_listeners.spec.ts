import 'reflect-metadata';
import { NotificationEventListeners } from './notification.event_listeners';
import { NotificationService } from './notification.service';
import { EmitterService } from '../shared/event_bus/event_emitter';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { EVENT_TYPES } from '../shared/event_bus/di/event.di';
import { Container } from 'inversify';
import { logger } from '../shared/configs/logger';

jest.mock('../shared/configs/logger');

describe('NotificationEventListeners', () => {
  let notificationEventListeners: NotificationEventListeners;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let emitterServiceMock: jest.Mocked<EmitterService>;

  beforeEach(() => {
    notificationServiceMock = {
      sendUserNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    emitterServiceMock = {
      on: jest.fn(),
    } as unknown as jest.Mocked<EmitterService>;

    const container = new Container();
    container.bind(NOTIFICATION_TYPES.NotificationService).toConstantValue(notificationServiceMock);
    container.bind(EVENT_TYPES.EmitterService).toConstantValue(emitterServiceMock);

    notificationEventListeners = new NotificationEventListeners(notificationServiceMock, emitterServiceMock);
  });

  it('should register event listeners on instantiation', () => {
    expect(emitterServiceMock.on).toHaveBeenCalledWith(
      'userRegistered',
      expect.any(Function)
    );
    expect(emitterServiceMock.on).toHaveBeenCalledWith(
      'userLoggedIn',
      expect.any(Function)
    );
  });

  it('should attempt to send notification when userRegistered event is emitted', async () => {
    const userId = 'user123';
    const sendNotificationMock = jest.fn().mockResolvedValue({ id: 'notif1' });
    notificationServiceMock.sendUserNotification = sendNotificationMock;
    
    const eventCall = emitterServiceMock.on.mock.calls.find(([event]) => event === 'userRegistered');
    if (!eventCall) {
    throw new Error("Event listener for 'userRegistered' was not registered.");
    }
    const callback = eventCall[1];
    await callback(userId);

    expect(sendNotificationMock).toHaveBeenCalledWith(userId, 'Welcome! Your registration was successful.', 'user.registration');
  });

  it('should retry on failure and log error after max retries', async () => {
    const userId = 'user123';
    notificationServiceMock.sendUserNotification.mockRejectedValue(new Error('Test Error'));
    
    const eventCall = emitterServiceMock.on.mock.calls.find(([event]) => event === 'userRegistered');
    if (!eventCall) {
    throw new Error("Event listener for 'userRegistered' was not registered.");
    }

    const callback = eventCall[1];
    const result = await callback(userId);

    expect(notificationServiceMock.sendUserNotification).toHaveBeenCalledTimes(3);
    expect(logger.error).toHaveBeenCalledWith('Max retries reached. Operation failed.');
    expect(result).toBeNull();
  });
});
