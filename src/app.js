import express from 'express';
import cors from 'cors';
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
app.use(express.json());
const FRONTEND_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_ORIGIN
    : 'http://localhost:3001';

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.set('trust proxy', 1);

// session + passport
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
