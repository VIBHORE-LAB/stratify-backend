import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import db from '../models/index.js';
import {comparePassword} from '../utils/hash.js';

const {User} = db;
export default function initPassport() {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (!user) return done(null, false, { message: 'Invalid credentials' });
          const ok = await comparePassword(password, user.passwordHash);
          if (!ok) return done(null, false, { message: 'Invalid credentials' });
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      })
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await User.findByPk(payload.sub);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (e) {
          return done(e, false);
        }
      }
    )
  );
}
