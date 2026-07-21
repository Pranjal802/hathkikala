import type { UserDocument } from '../models/User.js';

// Passport's default Express.User is an empty interface, so req.user
// has no useful type info out of the box. This makes req.user._id,
// req.user.email etc. type-safe everywhere without casting.
declare global {
  namespace Express {
    interface User extends UserDocument {}

    interface Request {
      // Set by the validateQuery middleware. Typed as unknown here and cast
      // to the specific *QueryDto type in each controller that uses it -
      // req.query itself can't be reassigned in Express 5 (it's a getter).
      validatedQuery?: unknown;
    }
  }
}

export {};
