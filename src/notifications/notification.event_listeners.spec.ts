import request from 'supertest';
import { Container } from 'inversify';
import { NotificationEventListeners } from './notification.event_listeners';
import { NotificationService } from './notification.service';
import { EmitterService } from '../shared/event_bus/event_emitter';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { EVENT_TYPES } from '../shared/event_bus/di/event.di';
import { createApp } from '../app';

describe('Notification Event Listeners Integration Test', () => {
  let container: Container;
  let notificationEventListeners: NotificationEventListeners;
  let notificationService: NotificationService;
  let emitterService: EmitterService;
  let app: any;

  beforeAll(async () => {
    // Initialize the container and services
    container = new Container();
    notificationService = { 
      sendUserNotification: jest.fn(),
    } as unknown as NotificationService;

    emitterService = { 
      emit: jest.fn(),
      on: jest.fn(),
    } as unknown as EmitterService;

    // Bind the services to the container
    container.bind(NOTIFICATION_TYPES.NotificationService).toConstantValue(notificationService);
    container.bind(EVENT_TYPES.EmitterService).toConstantValue(emitterService);

    // Instantiate the event listeners
    notificationEventListeners = container.get(NotificationEventListeners);

    // Set up the app
    app = await createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  it('should handle userRegistered event and send a welcome notification', async () => {
    const userId = 'user123';

    // Mock successful notification service call
    (notificationService.sendUserNotification as jest.Mock).mockResolvedValue({
      userId,
      message: 'Welcome! Your registration was successful.',
      type: 'user.registration',
    });

    // Trigger the event via HTTP (simulate the 'userRegistered' event)
    await request(app)
      .post('/events/userRegistered') // Example route that triggers event
      .send({ userId });

    // Ensure the notificationService was called
    expect(notificationService.sendUserNotification).toHaveBeenCalledWith(
      userId,
      'Welcome! Your registration was successful.',
      'user.registration',
    );
  });

  it('should retry sending notification up to 3 times if it fails', async () => {
    const userId = 'user123';

    // Simulate a failed notification on the first attempt
    (notificationService.sendUserNotification as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to send notification')) // First attempt fails
      .mockResolvedValue({ userId, message: 'Welcome! Your registration was successful.', type: 'user.registration' }); // Second attempt succeeds

    // Trigger the event via HTTP
    await request(app)
      .post('/events/userRegistered')
      .send({ userId });

    // Ensure retry logic is invoked, meaning the sendUserNotification method is called twice
    expect(notificationService.sendUserNotification).toHaveBeenCalledTimes(2); // First failed, then retry
  });

  it('should handle userLoggedIn event and send a login notification', async () => {
    const userId = 'user456';

    // Mock successful notification service call
    (notificationService.sendUserNotification as jest.Mock).mockResolvedValue({
      userId,
      message: 'You have successfully logged in.',
      type: 'user.login',
    });

    // Trigger the event via HTTP (simulate the 'userLoggedIn' event)
    await request(app)
      .post('/events/userLoggedIn') // Example route that triggers event
      .send({ userId });

    // Ensure the notificationService was called
    expect(notificationService.sendUserNotification).toHaveBeenCalledWith(
      userId,
      'You have successfully logged in.',
      'user.login',
    );
  });

  it('should return null after retrying if notification sending fails 3 times', async () => {
    const userId = 'user789';

    // Simulate failing notification for 3 retries
    (notificationService.sendUserNotification as jest.Mock)
      .mockRejectedValue(new Error('Failed to send notification'));

    // Trigger the event via HTTP
    await request(app)
      .post('/events/userRegistered')
      .send({ userId });

    // Ensure the sendUserNotification was retried 3 times and eventually failed
    expect(notificationService.sendUserNotification).toHaveBeenCalledTimes(3);
  });
});
