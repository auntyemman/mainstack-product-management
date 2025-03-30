import { inject, injectable } from 'inversify';
import { NotificationRepository } from './notification.repository';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { INotification } from './notification.model';
import { UnprocessableEntityError } from '../shared/utils/custom_error';
import { QueryOptions } from 'mongoose';
import { PaginationResult } from '../shared/utils/pagination';

@injectable()
export class NotificationService {
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationRepository) 
    private readonly notificationRepository: NotificationRepository
  ) {}

  async sendUserNotification(userId: string, message: string, type: string): Promise<INotification> {
    const notification = await this.notificationRepository.create({userId, message, type});
    if (!notification) {
        throw new UnprocessableEntityError('Failed to send notification');
    }
    return notification;
  }

  async getUserNotification(notificationId: string) {
    const notification = await this.notificationRepository.findOne({_id: notificationId});
    if (!notification) {
        throw new UnprocessableEntityError('Failed get notification');
    }
    return notification;
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    const notifications = await this.notificationRepository.findMany(userId);
    if (!notifications) {
        throw new UnprocessableEntityError('Failed get notification');
    }
    return notifications;
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.notificationRepository.update(notificationId, {isRead: true});
  }
}
