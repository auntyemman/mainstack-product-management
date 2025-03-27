import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authUser } from '../../shared/middlewares/auth';
import { bindMethods } from '../../shared/utils/bind_method';

export const auth: Router = Router();
const userCont = bindMethods(new AuthController());

auth.post('/signup', userCont.signUp);
auth.post('/admin', userCont.createAdmin);
auth.post('/login', userCont.login);
auth.get('/refresh', authUser, userCont.refreshToken);
auth.delete('/logout', authUser, userCont.logout);