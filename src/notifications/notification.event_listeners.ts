import { inject, injectable } from 'inversify';
import { EmitterService } from '../shared/event_bus/event_emitter';
import { NotificationService } from './notification.service';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { EVENT_TYPES } from '../shared/event_bus/di/event.di';
import { INotification } from './notification.model';
import { logger } from '../shared/configs/logger';

@injectable()
export class NotificationEventListeners {
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,

    @inject(EVENT_TYPES.EmitterService)
    private readonly emitterService: EmitterService,
  ) {
    this.registerListeners();
  }

  // Register all notification-related event listeners with retry strategy
  private registerListeners(): void {
    this.emitterService.on(
      'userRegistered',
      async (userId: string): Promise<INotification | null> => {
        return await this.retry<INotification | null>(async () => {
          return await this.notificationService.sendUserNotification(
            userId,
            'Welcome! Your registration was successful.',
            'user.registration',
          );
        });
      },
    );

    this.emitterService.on(
      'userLoggedIn',
      async (userId: string): Promise<INotification | null> => {
        return await this.retry<INotification | null>(async () => {
          return await this.notificationService.sendUserNotification(
            userId,
            'You have successfully logged in.',
            'user.login',
          );
        });
      },
    );
  }

  // Retry mechanism
  // Retry the given function up to `maxRetries` times with a delay of `delay` milliseconds between each retry.
  private async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 2000,
  ): Promise<T | null> {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          logger.error('Max retries reached. Operation failed.');
          return null;
        }
      }
    }
    return null; // Return `null` if all retries fail
  }
}
