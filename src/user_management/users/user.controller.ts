import { Request, Response, NextFunction } from 'express';

import { UserService } from './user.service';
import { validateRequest } from '../../shared/utils/request_validator';
import { SignUpDTO, SignInDTO, UpdateDTO, UserRole, CreateAdminDTO } from './user.dto';
import { AuthenticationService } from '../authentication/authentication.service';
import { APIError } from '../../shared/utils/custom_error';
import crypto from 'crypto';

export class UserController {
  private readonly userService;
  private readonly authService;
  constructor() {
    this.userService = new UserService();
    this.authService = new AuthenticationService();
  }

  async signUp(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const validated = await validateRequest(SignUpDTO, req.body);
      const user = await this.userService.createUser(validated);
      if (!user) {
        throw new APIError('Failed to create user');
      }
      const { id, email } = user;
      return res.status(201).json({
        status: 'success',
        message: `Registration successful`,
        data: {
          id: id,
          email: email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const payload = { ...req.body, role: UserRole.admin };
      const validated = await validateRequest(CreateAdminDTO, payload);
      const user = await this.userService.createUser(validated);
      if (!user) {
        throw new APIError('Failed to create user');
      }
      const { id, email } = user;
      return res.status(201).json({
        status: 'success',
        message: `Admin creation successful`,
        data: {
          id: id,
          email: email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const validated = await validateRequest(SignInDTO, req.body);
      const user = await this.userService.login(validated);

      // Generate both access and refresh tokens
      const accessToken = this.authService.createAccessToken({ user: user });
      const refreshToken = this.authService.createRefreshToken({ user: user });

      // Store refresh token in HTTP-only cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Prevents JS from accessing the token
        secure: true, // process.env.NODE_ENV === 'production', // Set secure to true in production
        sameSite: 'strict',
      });

      return res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new APIError('Refresh token not found');
      }

      // Verify the refresh token
      const decoded = await AuthenticationService.verifyJWT(refreshToken);

      // Generate a new access token
      const newAccessToken = this.authService.createAccessToken({ user: decoded });

      return res.status(200).json({
        status: 'success',
        message: 'New access token generated',
        data: { accessToken: newAccessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, // process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  async generateKeys(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const { _id } = res.locals.user.user;
      const keys = await this.userService.generateUserKeys(_id);
      if (!keys) {
        throw new APIError('could not generate keys');
      }
      const { publicKey, hashedPrivateKey } = keys;
      return res.status(201).json({
        status: 'success',
        message: 'Key pair generated successfully.',
        data: {
          publicKey,
          hashedPrivateKey, // Be cautious about sending back the private key; consider encrypting it first.
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getkey(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const { _id } = res.locals.user.user;
      const publicKey = await this.userService.deleteKeys(_id);
      return res.status(200).json({
        status: 'success',
        data: {
          publicKey,
        },
      })
    } catch (error) {
      next(error);
    }
  }

  async deletekey(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const { _id } = res.locals.user.user;
      const user = await this.userService.deleteKeys(_id);
      return res.status(200).json({
        status: 'success',
        message: 'Key pair deleted successfully.',
        data: {
          user,
        },
      })
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const user = await this.userService.getUser(id);
      return res.status(200).json({
        status: 'success',
        message: 'User fetched successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    const { _id } = res.locals.user.user;
    try {
      const user = await this.userService.getUser(_id);
      return res.status(200).json({
        status: 'success',
        message: 'profile in session fetched successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    const { _id } = res.locals.user.user;
    try {
      const validated = await validateRequest(UpdateDTO, req.body);
      const updatedUser = await this.userService.updateUser(_id, validated);
      return res.status(200).json({
        status: 'success',
        message: 'user updated succesfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
