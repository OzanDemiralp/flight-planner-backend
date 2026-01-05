import session from 'express-session';
import MongoStore from 'connect-mongo';

export function sessionMiddleware() {
  const isProd = process.env.NODE_ENV === 'production';

  return session({
    name: 'fp.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 14, // 14 gün
    }),
    cookie: {
      httpOnly: true,
      secure: isProd, // prod HTTPS şart
      sameSite: isProd ? 'none' : 'lax', // FE farklı domain ise prod'da none
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  });
}
