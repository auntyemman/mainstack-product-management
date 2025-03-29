import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/custom_error';
import { UserRole } from '../../user_management/users/user.dto';

export const adminRBAC = async (req: Request, res: Response, next: NextFunction) => {
  const { role } = res.locals.user;
  try {
    // If the user is not an admin, throw a ForbiddenError.
    if (role !== UserRole.admin) {
      throw new ForbiddenError('You are not an admin');
    }
    // Otherwise, call the next middleware in the stack.
    next();
  } catch (err) {
    // If there was an error, call the next middleware in the stack with the error.
    next(err);
  }
};
