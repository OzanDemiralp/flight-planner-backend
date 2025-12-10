import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { planTrip } from './controllers/tripController.js';
import { validate } from './middleware/validate.js';
import { planTripSchema } from './validation/planTripSchema.js';

dotenv.config();
const dbUrl = process.env.MONGO_URL;

const app = express();
app.use(express.json());

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});

app.get('/test', (req, res) => {
  res.send('Hello!');
});

app.post('/planTrip', validate(planTripSchema), planTrip);

app.listen(3000, () => {
  console.log('Serving on port 3000');
});
