import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../shared/configs';
import { BadRequestError, NotFoundError } from '../../shared/utils/custom_error';
import { JWT_Expiration } from './auth.dto';
import { UserRepository } from '../users/user.repository';
import { IUser } from '../users/user.model';
import { comparePasswords, hashPassword } from '../../shared/utils/password_hash';

export class AuthenticationService {
  private readonly userRepo;
  constructor() {
    this.userRepo = new UserRepository();
  }
  async createUser(data: IUser): Promise<IUser> {
    const user = await this.userRepo.findByEmail(data.email);
    if (user) {
      throw new BadRequestError('User already exists');
    }
    const hashedPassword = await hashPassword(data.password);
    data.password = hashedPassword;
    return await this.userRepo.create(data);
  }

  async login(data: IUser): Promise<IUser> {
    const { email, password } = data;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Not found');
    }
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestError('Password not match');
    }
    return user;
  }

  createAccessToken = (payload: object) => {
    return this.token(payload, JWT_Expiration.accessToken);
  };

  createRefreshToken = (payload: object) => {
    return this.token(payload, JWT_Expiration.refreshToken);
  };

  static verifyJWT = async (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { decoded, expired: false, valid: true };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { decoded: null, expired: true, valid: false };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestError('Invalid token');
      }
    }
  };

  private token = (payload: object, expiration: string) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiration, algorithm: 'HS256' });
  };
}
