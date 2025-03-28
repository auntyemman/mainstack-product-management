import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotAuthorizedError } from '../utils/custom_error';
import { createAccessToken, verifyJWT } from '../utils/jwt.util';

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new NotAuthorizedError();
    }

    const token = authorizationHeader.split(' ')[1];
    const result = await verifyJWT(token);
    if (!result) {
      throw new NotAuthorizedError();
    }
    const { decoded, expired } = result;

    if (expired) {
      // Handle token expiration
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new BadRequestError('you may need to login again');
      }

      const refreshTokenResult = await verifyJWT(refreshToken);
      if (
        !refreshTokenResult ||
        refreshTokenResult.valid === false ||
        refreshTokenResult.expired === true
      ) {
        throw new NotAuthorizedError();
      }

      // Issue new access token
      const newAccessToken = createAccessToken({ user: refreshTokenResult.decoded });

      // Set new access token in response header
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);

      res.locals.user = refreshTokenResult.decoded; // Set user data from refresh token
    } else {
      res.locals.user = decoded; // Set user data from access token
    }

    next(); // Proceed to next middleware
  } catch (err) {
    next(err); // Pass any errors to the next middleware
  }
};
