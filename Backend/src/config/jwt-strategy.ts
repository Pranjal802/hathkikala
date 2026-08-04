import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, type StrategyOptionsWithoutRequest } from 'passport-jwt';
import type { Request } from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Custom extractor: pull token from cookie or Authorization header
const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies.token || null;
    }
    return null;
};

const secret = process.env.JWT_SECRET || '771a68cc448bae219196b26c0c7948f133857cbd61bb505d92454309c78511b50315a1dfafa08a370018b30cdd709a32fd1d7f012ebce85aa763a0154d93bfe1';

const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: secret,
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