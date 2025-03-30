import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../shared/configs';
import { BadRequestError, NotFoundError } from '../../shared/utils/custom_error';
import { UserRepository } from '../users/user.repository';
import { IUser } from '../users/user.model';
import { comparePasswords, hashPassword } from '../../shared/utils/password_hash';
import { inject, injectable } from 'inversify';
import { USER_TYPES } from '../users/di/user.types';
import { createAccessToken, createRefreshToken, verifyJWT } from '../../shared/utils/jwt.util';
import { JWTPayload } from './auth.dto';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';
import { EmitterService } from '../../shared/event_bus/event_emitter';

@injectable()
export class AuthenticationService {
  constructor(@inject(USER_TYPES.UserRepository) private readonly userRepo: UserRepository, @inject(EVENT_TYPES.EmitterService) private readonly emitterService: EmitterService){
    this.userRepo = userRepo;
    this.emitterService = emitterService;
  }
  async createUser(data: IUser): Promise<IUser> {
    const user = await this.userRepo.findByEmail(data.email);
    if (user) {
      throw new BadRequestError('User already exists');
    }
    const hashedPassword = await hashPassword(data.password);
    data.password = hashedPassword;
    const newUser = await this.userRepo.create(data);
    await this.emitterService.emitAsync('userRegistered', newUser.id);  // Emit an event when a user is created
    return newUser;
  }

  async login(data: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = data;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Not found');
    }
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestError('Password not match');
    }
    // Generate both access and refresh tokens
    const accessToken = createAccessToken({ sub: user._id } as JWTPayload);
    const refreshToken = createRefreshToken({ sub: user._id } as JWTPayload);
    await this.emitterService.emitAsync('userLoggedIn', user.id);  // Emit an event when a user is created
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    // Verify the refresh token
    const data = await verifyJWT(refreshToken);
    if (!data || !data.decoded) {
      throw new BadRequestError('Invalid refresh token');
    }
    // Generate a new access token
    const newAccessToken = createAccessToken({ sub: data.decoded.sub } as JWTPayload);
    return newAccessToken;
  }
}
