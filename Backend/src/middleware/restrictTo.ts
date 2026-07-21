import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

// Usage: router.post('/', protect, restrictTo('admin'), createCategory)
// Must run AFTER `protect`, since it relies on req.user being set.
export const restrictTo = (...roles: Array<'customer' | 'user' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
