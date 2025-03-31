import { Container } from 'inversify';
import { NotificationRepository } from '../notification.repository';
import { NotificationService } from '../notification.service';
import { NotificationController } from '../notification.controller';
import { NotificationEventListeners } from '../notification.event_listeners';
import { NOTIFICATION_TYPES } from './notification.di';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';
import { eventContainer } from '../../shared/event_bus/di/event.container';

const notificationContainer = new Container();

notificationContainer
  .bind<NotificationRepository>(NOTIFICATION_TYPES.NotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();
notificationContainer
  .bind<NotificationService>(NOTIFICATION_TYPES.NotificationService)
  .to(NotificationService)
  .inSingletonScope();
notificationContainer
  .bind<NotificationController>(NOTIFICATION_TYPES.NotificationController)
  .to(NotificationController)
  .inSingletonScope();
notificationContainer
  .bind<NotificationEventListeners>(NOTIFICATION_TYPES.NotificationEventListeners)
  .to(NotificationEventListeners)
  .inSingletonScope();

// binding from other services to inventory
// Use the shared instance of EmitterService from the event bus
notificationContainer
  .bind(EVENT_TYPES.EmitterService)
  .toDynamicValue(() => eventContainer.get(EVENT_TYPES.EmitterService));
export { notificationContainer };
