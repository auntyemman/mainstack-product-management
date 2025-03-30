import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../shared/utils/request_validator';
import { SignUpDTO, SignInDTO } from '../users/user.dto';
import { AuthenticationService } from '../auth/auth.service';
import { successResponse } from '../../shared/utils/api_response';
import { inject, injectable } from 'inversify';
import { AUTH_TYPES } from './di/auth.types';

@injectable()
export class AuthController {
  // private readonly authService;
  constructor(@inject(AUTH_TYPES.AuthService) private readonly authService: AuthenticationService) {
    this.authService = authService;
  }

  async signUp(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const validated = await validateRequest(SignUpDTO, req.body);
      const user = await this.authService.createUser(validated);
      // testable typed response 
      const response = successResponse(201, 'User registered successfully', user);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const validated = await validateRequest(SignInDTO, req.body);
      const { accessToken, refreshToken } = await this.authService.login(validated);
      const data = { accessToken: accessToken, refreshToken: refreshToken };
      // Store refresh token in HTTP-only cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Prevents JS from accessing the token
        secure: true, // process.env.NODE_ENV === 'production', // Set secure to true in production
        sameSite: 'strict',
      });

      const response = successResponse(201, 'User logged in successfully', data);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const newAccessToken = await this.authService.refreshToken(refreshToken);
      
      const response = successResponse(201, 'New access token generated', { accessToken: newAccessToken });
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}
