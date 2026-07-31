import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map(e => e.message).join(', ');
      throw new AppError(message, 400);
    }
    req.body = result.data;
    next();
  };
};

// Same idea, but for query params (?minPrice=100&sort=price_asc etc) instead
// of the request body - used on GET routes with filters/pagination.
export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues.map(e => e.message).join(', ');
      throw new AppError(message, 400);
    }
    // Stash parsed/coerced query on a custom property - Express 5 makes
    // req.query a read-only getter, so we can't reassign req.query directly.
    req.validatedQuery = result.data;
    next();
  };
};