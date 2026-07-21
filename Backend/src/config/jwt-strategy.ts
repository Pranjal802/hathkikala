import passport from 'passport';
import { Strategy as JwtStrategy, type StrategyOptionsWithoutRequest } from 'passport-jwt';
import type { Request } from 'express';
import User from '../models/User.js';

// Custom extractor: pull token from cookie instead of Authorization header
const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies.token || null;
    }
    return null;
};

const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            if (Date.now() >= payload.exp * 1000) {
                return done(null, false, { message: "Session expired" });
            }
            const user = await User.findById(payload.userId);
            if (!user) {
                return done(null, false);
            }
            return done(null, user); // attaches user to req.user
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport;