import { Router } from 'express';
import { UserController } from './user.controller';
import { authUser } from '../../shared/middlewares/auth';
import { bindMethods } from '../../shared/utils/bind_method';
import { userContainer } from './di/user.container';
import { USER_TYPES } from './di/user.types';
import { UserRepository } from './user.repository';

export const user: Router = Router();
const userController = userContainer.get(USER_TYPES.UserController);
const userCont = bindMethods(userController) as UserController;

// Pass userRepository into the middleware
const userRepository = userContainer.get<UserRepository>(USER_TYPES.UserRepository);
export const authMiddleware = authUser(userRepository);

user.delete('/logout', authMiddleware, userCont.logout);
user.patch('/:id', authMiddleware, userCont.makeAdmin);
// user.post('/users/key-pair-generation', authUser, userCont.generateKeys);
// user.get('/users/key', authUser, userCont.getkey);
// user.delete('/users/key', authUser, userCont.deletekey);
user.get('/me', authMiddleware, userCont.getProfile);
user.get('/:id', authMiddleware, userCont.getUser);
user.put('/:id', authMiddleware, userCont.updateProfile);
