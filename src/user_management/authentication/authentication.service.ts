import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../shared/configs';
import { BadRequestError } from '../../shared/utils/custom_error';
import { JWT_Expiration } from './authentication.dto';

export class AuthenticationService {
  constructor() {}

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
