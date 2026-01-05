import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

export function setupPassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            email: email.toLowerCase().trim(),
          });
          if (!user)
            return done(null, false, { message: 'Invalid credentials' });

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return done(null, false, { message: 'Invalid credentials' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('_id email name');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
}
