import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../configs";
import { BadRequestError } from "./custom_error";
import { environment } from './environment';

export const createAccessToken = (payload: object) => {
    return token(payload, environment.jwt.expiresIn);
  };

export const createRefreshToken = (payload: object) => {
    return token(payload, environment.jwt.freshTokenExpiresIn);
  };

export const verifyJWT = async (token: string) => {
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

  const token = (payload: object, expiration: string) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiration, algorithm: 'HS256' });
  };