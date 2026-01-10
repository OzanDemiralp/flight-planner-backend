import session from 'express-session';
import MongoStore from 'connect-mongo';
import 'dotenv/config';

export function sessionMiddleware() {
  const isProd = process.env.NODE_ENV === 'production';

  return session({
    name: 'fp.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 14,
    }),
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  });
}
