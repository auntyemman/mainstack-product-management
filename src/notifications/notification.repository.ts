import { injectable } from 'inversify';
import { Notification, INotification } from './notification.model';
import BaseRepository from '../shared/database/base.repository';
import { QueryOptions } from 'mongoose';
import { paginate, PaginationResult } from '../shared/utils/pagination';
import { IInventory } from '../product_management/inventory/inventory.model';

@injectable()
export class NotificationRepository extends BaseRepository<INotification> {
  private readonly notificationModel;
  constructor() {
    super(Notification);
    this.notificationModel = Notification;
  }

  async findMany(userId: string): Promise<INotification[]> {
    return await this.notificationModel.find({ userId }).sort({ createdAt: -1 });
  }
}
