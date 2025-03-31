import { Container } from 'inversify';
import { AuthController } from '../auth.controller';
import { AuthenticationService } from '../auth.service';
import { UserService } from '../../users/user.service';
import { UserRepository } from '../../users/user.repository';
import { AUTH_TYPES } from './auth.di';
import { USER_TYPES } from '../../users/di/user.types';
import { EVENT_TYPES } from '../../../shared/event_bus/di/event.di';
import { eventContainer } from '../../../shared/event_bus/di/event.container';
import { userContainer } from '../../users/di/user.container';

export const authContainer = new Container();

// Bind dependencies
authContainer.bind(AUTH_TYPES.AuthService).to(AuthenticationService);
authContainer.bind(AUTH_TYPES.AuthController).to(AuthController);

// other services binding to maintain singleton
authContainer
  .bind(USER_TYPES.UserService)
  .toDynamicValue(() => userContainer.get(USER_TYPES.UserService));
authContainer
  .bind(USER_TYPES.UserRepository)
  .toDynamicValue(() => userContainer.get(USER_TYPES.UserRepository));
authContainer
  .bind(EVENT_TYPES.EmitterService)
  .toDynamicValue(() => eventContainer.get(EVENT_TYPES.EmitterService));
