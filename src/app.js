import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { planTrip } from './controllers/tripController.js';
import { validate } from './middleware/validate.js';
import { errorHandler } from './middleware/errorHandler.js';
import { planTripSchema } from './validation/planTripSchema.js';
import { sessionMiddleware } from './config/session.js';
import { setupPassport } from './config/passport.js';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import savedTripsRoutes from './routes/savedTripsRoutes.js';
import requireAuth from './middleware/requireAuth.js';

const app = express();

const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

//security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

//body parsing
app.use(express.json({ limit: '1mb' }));

//cors
const FRONTEND_ORIGIN = isProd
  ? process.env.FRONTEND_ORIGIN
  : 'http://localhost:3001';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);

//global rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // çok sıkı değil; sonra düşürürüz
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

//login endpoint rate limit
app.use(
  '/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

//session + passport
app.use(sessionMiddleware());
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

//routes
app.get('/test', (req, res) => res.send('Hello!'));

app.post('/planTrip', requireAuth, validate(planTripSchema), planTrip);

app.use('/auth', authRoutes);
app.use('/', savedTripsRoutes);

app.all(/(.*)/, (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
