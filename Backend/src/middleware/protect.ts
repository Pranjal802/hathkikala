import passport from 'passport';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return next(new AppError('Unauthorized', 401));
    }
    req.user = user; // now available as req.user, not req.userId
    next();
  })(req, res, next);
};