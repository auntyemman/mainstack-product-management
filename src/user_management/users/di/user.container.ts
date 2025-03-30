import { Container } from 'inversify';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UserController } from '../user.controller';
import { USER_TYPES } from './user.types';

export const userContainer = new Container();

// Bind dependencies
userContainer.bind(USER_TYPES.UserService).to(UserService);
userContainer.bind(USER_TYPES.UserRepository).to(UserRepository);
userContainer.bind(USER_TYPES.UserController).to(UserController);
