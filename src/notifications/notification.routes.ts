import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authUser } from '../shared/middlewares/auth';
import { bindMethods } from '../shared/utils/bind_method';
import { notificationContainer } from './di/notification.container';
import { NOTIFICATION_TYPES } from './di/notification.di';
import { UserRepository } from '../user_management/users/user.repository';
import { userContainer } from '../user_management/users/di/user.container';
import { USER_TYPES } from '../user_management/users/di/user.types';

export const notification: Router = Router();
const notificationController = notificationContainer.get<NotificationController>(
  NOTIFICATION_TYPES.NotificationController,
);
const notificationCont = bindMethods(notificationController) as NotificationController;

// Pass userRepository into the middleware
const userRepository = userContainer.get<UserRepository>(USER_TYPES.UserRepository);
const authMiddleware = authUser(userRepository);

notification.get('/', authMiddleware, notificationCont.getUserNotifications);
notification.patch('/:notificationId', authMiddleware, notificationCont.markNotificationAsRead);
