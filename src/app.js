import express from 'express';
import cors from 'cors';
import { planTrip } from './controllers/tripController.js';
import { validate } from './middleware/validate.js';
import { errorHandler } from './middleware/errorHandler.js';
import { planTripSchema } from './validation/planTripSchema.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3001',
  })
);

app.get('/test', (req, res) => res.send('Hello!'));

app.post('/planTrip', validate(planTripSchema), planTrip);

app.all(/(.*)/, (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
