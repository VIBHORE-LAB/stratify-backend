import passport from 'passport';

export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireLocal = passport.authenticate('local', { session: false });
