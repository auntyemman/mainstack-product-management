import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authUser } from '../../shared/middlewares/auth';
import { bindMethods } from '../../shared/utils/bind_method';
import { authContainer } from './di/auth.container';
import { AUTH_TYPES } from './di/auth.types';

export const auth: Router = Router();

// Bind methods to the controller
const authController = authContainer.get(AUTH_TYPES.AuthController);
const userCont = bindMethods(authController) as AuthController;

auth.post('/signup', userCont.signUp);
auth.post('/login', userCont.login);
auth.get('/refresh', authUser, userCont.refreshToken);