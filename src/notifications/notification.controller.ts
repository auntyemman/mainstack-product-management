import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { NotificationService } from './notification.service';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { successResponse } from '../shared/utils/api_response';

@injectable()
export class NotificationController {
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationService) 
    private readonly notificationService: NotificationService
  ) {}

  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const { user } = res.locals;
      const notifications = await this.notificationService.getUserNotifications(user._id.toString());
      const response = successResponse(200, 'User notifications fetched successfully', notifications);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const success = await this.notificationService.markNotificationAsRead(notificationId);
      const response = successResponse(200, 'Notification marked as read', { success });
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}
