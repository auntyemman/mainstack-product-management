import { Request, Response, NextFunction } from 'express';

import { UserService } from './user.service';
import { validateRequest } from '../../shared/utils/request_validator';
import { SignUpDTO, SignInDTO, UpdateDTO, UserRole, CreateAdminDTO } from './user.dto';
import { AuthenticationService } from '../auth/auth.service';
import { APIError } from '../../shared/utils/custom_error';
import crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { USER_TYPES } from './di/user.types';
import { successResponse } from '../../shared/utils/api_response';

@injectable()
export class UserController {
  constructor(@inject(USER_TYPES.UserService) private readonly userService: UserService) {
    this.userService = userService;
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
  // async generateKeys(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
  //   try {
  //     const { _id } = res.locals.user;
  //     const keys = await this.userService.generateUserKeys(_id);
  //     if (!keys) {
  //       throw new APIError('could not generate keys');
  //     }
  //     const { publicKey, hashedPrivateKey } = keys;
  //     return res.status(201).json({
  //       status: 'success',
  //       message: 'Key pair generated successfully.',
  //       data: {
  //         publicKey,
  //         hashedPrivateKey, // Be cautious about sending back the private key; consider encrypting it first.
  //       },
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async getkey(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
  //   try {
  //     const { _id } = res.locals.user;
  //     const publicKey = await this.userService.deleteKeys(_id);
  //     return res.status(200).json({
  //       status: 'success',
  //       data: {
  //         publicKey,
  //       },
  //     })
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async deletekey(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
  //   try {
  //     const { _id } = res.locals.user;
  //     const user = await this.userService.deleteKeys(_id);
  //     return res.status(200).json({
  //       status: 'success',
  //       message: 'Key pair deleted successfully.',
  //       data: {
  //         user,
  //       },
  //     })
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const id = req.params.id;
      const user = await this.userService.getUser(id);
      const response = successResponse(200, 'User fetched successfully', user);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      // user in session
      const { user } = res.locals;
      const response = successResponse(200, 'profile in session fetched successfully', user);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    const { _id } = res.locals.user.user;
    try {
      const validated = await validateRequest(UpdateDTO, req.body);
      const updatedUser = await this.userService.updateUser(_id, validated);
      const response = successResponse(200, 'Profile updated successfully', updatedUser);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async makeAdmin(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
      const userId = req.params.id;
      try {
        const user = await this.userService.makeAdmin(userId);
        return res.status(201).json({
          status: 'success',
          message: `User made an admin successfully`,
          data: { role: user.role},
        });
      } catch (error) {
        next(error);
      }
    }
}
