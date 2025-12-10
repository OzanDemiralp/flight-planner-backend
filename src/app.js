import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getTripBounds } from './utils/tripBounds.js';
import { getCandidateFlights } from './utils/tripFlights.js';
import { buildTrips } from './utils/tripBuilder.js';

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

app.post('/planTrip', async (req, res) => {
  try {
    // destructure req body
    const {
      departureFrom,
      departureTo,
      returnFrom,
      returnTo,
      minNonWorkingDays,
      vacationLength,
      searchWindow,
    } = req.body;

    //calculate bounds for trips to be searched
    const { start, end, latestOutbound, earliestReturn, hasRoom } =
      getTripBounds(searchWindow, vacationLength);

    if (!hasRoom) {
      return res.json({ trips: [], tripCount: 0 });
    }

    //query candidate flights for trip planning
    const { outboundFlights, returnFlights } = await getCandidateFlights({
      departureFrom,
      departureTo,
      returnFrom,
      returnTo,
      start,
      end,
      latestOutbound,
      earliestReturn,
    });

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength,
      minNonWorkingDays,
      end,
      earliestReturn,
    });

    //respond with valid trips
    return res.json({
      trips,
      tripCount: trips.length,
    });
  } catch (err) {
    console.error('Error in /planTrip:', err);
    return res.status(500).json({ error: 'Server error while planning trip.' });
  }
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
});
