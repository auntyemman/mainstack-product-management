import { Router } from 'express';
import { UserController } from './user.controller';
import { authUser } from '../../shared/middlewares/auth';
import { bindMethods } from '../../shared/utils/bind_method';

export const user: Router = Router();
const userCont = bindMethods(new UserController());

user.delete('/logout', authUser, userCont.logout);
// user.post('/users/key-pair-generation', authUser, userCont.generateKeys);
// user.get('/users/key', authUser, userCont.getkey);
// user.delete('/users/key', authUser, userCont.deletekey);
user.get('/me', authUser, userCont.getProfile);
user.get('/:id', authUser, userCont.getUser);
user.put('/:id', authUser, userCont.updateProfile);
