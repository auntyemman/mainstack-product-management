import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotAuthorizedError, NotFoundError } from '../utils/custom_error';
import { createAccessToken, verifyJWT } from '../utils/jwt.util';
import { UserRepository } from '../../user_management/users/user.repository';
import { JWTPayload } from '../../user_management/auth/auth.dto';

export const authUser =
  (userRepository: UserRepository) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new NotAuthorizedError();
      }

      const token = authorizationHeader.split(' ')[1];
      const result = await verifyJWT(token);
      if (!result || !result.decoded) {
        throw new NotAuthorizedError();
      }
      const { decoded, expired } = result;

      let user;
      if (expired) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          throw new BadRequestError('You may need to login again');
        }

        const refreshTokenResult = await verifyJWT(refreshToken);
        if (
          !refreshTokenResult ||
          !refreshTokenResult.decoded ||
          refreshTokenResult.valid === false ||
          refreshTokenResult.expired === true
        ) {
          throw new NotAuthorizedError();
        }

        const newAccessToken = createAccessToken({
          sub: refreshTokenResult.decoded.sub,
        } as JWTPayload);
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);

        user = await userRepository.findById(refreshTokenResult.decoded?.sub);
      } else {
        user = await userRepository.findById(decoded.sub);
      }
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.locals.user = user; // Attach user to response object
      next();
    } catch (err) {
      next(err);
    }
  };

// export const authUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const authorizationHeader = req.headers.authorization;

//     if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
//       throw new NotAuthorizedError();
//     }

//     const token = authorizationHeader.split(' ')[1];
//     const result = await verifyJWT(token);
//     if (!result) {
//       throw new NotAuthorizedError();
//     }
//     const { decoded, expired } = result;

//     if (expired) {
//       // Handle token expiration
//       const refreshToken = req.cookies.refreshToken;
//       if (!refreshToken) {
//         throw new BadRequestError('you may need to login again');
//       }

//       const refreshTokenResult = await verifyJWT(refreshToken);
//       if (
//         !refreshTokenResult ||
//         refreshTokenResult.valid === false ||
//         refreshTokenResult.expired === true
//       ) {
//         throw new NotAuthorizedError();
//       }

//       // Issue new access token
//       const newAccessToken = createAccessToken({ sub: refreshTokenResult.decoded?.sub } as JWTPayload);

//       // Set new access token in response header
//       res.setHeader('Authorization', `Bearer ${newAccessToken}`);

//       res.locals.user = refreshTokenResult.decoded; // Set user data from refresh token
//     } else {
//       res.locals.user = decoded; // Set user data from access token
//     }

//     next(); // Proceed to next middleware
//   } catch (err) {
//     next(err); // Pass any errors to the next middleware
//   }
// };
