import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configs';
import { BadRequestError } from './custom_error';
import { environment } from './environment';
import { JWTPayload } from '../../user_management/auth/auth.dto';

export const createAccessToken = (payload: JWTPayload) => {
  return token(payload, environment.jwt.expiresIn);
};

export const createRefreshToken = (payload: JWTPayload) => {
  return token(payload, environment.jwt.freshTokenExpiresIn);
};

export const verifyJWT = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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

const token = (payload: JWTPayload, expiration: string): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiration, algorithm: 'HS256' });
};
