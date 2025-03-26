import { Router } from 'express';
import { UserController } from './user.controller';
import { authUser } from '../../shared/middlewares/auth';
import { bindMethods } from '../../shared/utils/bind_method';

export const user: Router = Router();
const userCont = bindMethods(new UserController());

user.post('/auth/signup', userCont.signUp);
user.post('/auth/admin', userCont.createAdmin);
user.post('/auth/login', userCont.login);
user.get('/users/refresh', authUser, userCont.refreshToken);
user.delete('/users/logout', authUser, userCont.logout);
user.post('/users/key-pair-generation', authUser, userCont.generateKeys);
user.get('/users/key', authUser, userCont.getkey);
user.delete('/users/key', authUser, userCont.deletekey);
user.get('/users/profile', authUser, userCont.getProfile);
user.get('/users/:id', authUser, userCont.getUser);
user.put('/users/profile', authUser, userCont.updateProfile);
