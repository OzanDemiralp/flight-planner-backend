import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import Flight from './models/Flight.js';
import countNonWorkingDays from './utils/countNonWorkingDays.js';
import { holidays } from './utils/countNonWorkingDays.js';

const DAY_UNIT = 'day';

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

    const { startDate, endDate } = searchWindow;

    // normalize days with dayjs
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');

    // check search window validity
    if (end.isBefore(start)) {
      return res
        .status(400)
        .json({ error: 'endDate must be after startDate.' });
    }

    // calculate last useful outbound date
    const latestOutbound = end.subtract(vacationLength, DAY_UNIT);
    // calculate first useful return date
    const earliestReturn = start.add(vacationLength, DAY_UNIT);

    // validate if there is no room for a vacation of that length
    if (latestOutbound.isBefore(start) || earliestReturn.isAfter(end)) {
      return res.json({ trips: [], tripCount: 0 });
    }

    // query mongo: outbound flights
    const outboundFlights = await Flight.find({
      from: departureFrom,
      to: departureTo,
      departureDateTime: {
        $gte: start.toDate(),
        $lte: latestOutbound.toDate(),
      },
    });

    // query mongo: return flights
    const returnFlights = await Flight.find({
      from: returnFrom,
      to: returnTo,
      departureDateTime: {
        $gte: earliestReturn.toDate(),
        $lte: end.toDate(),
      },
    });

    // group return flights by (date only) string
    const returnFlightsByDate = new Map(); // key: 'YYYY-MM-DD' -> Flight[]

    returnFlights.forEach((flight) => {
      const key = dayjs(flight.departureDateTime)
        .startOf('day')
        .format('YYYY-MM-DD');

      if (!returnFlightsByDate.has(key)) {
        returnFlightsByDate.set(key, []);
      }
      returnFlightsByDate.get(key).push(flight);
    });

    // trips array
    const foundTrips = [];

    outboundFlights.forEach((outboundFlight) => {
      const outboundFlightDate = dayjs(
        outboundFlight.departureDateTime
      ).startOf('day');

      // desired return = outbound + vacationLength days
      const desiredReturnDate = outboundFlightDate.add(
        vacationLength,
        DAY_UNIT
      );

      const returnKey = desiredReturnDate.format('YYYY-MM-DD');
      const candidates = returnFlightsByDate.get(returnKey);

      // no return flights on that exact day → skip
      if (!candidates || candidates.length === 0) return;

      // for each return flight on the correct date
      candidates.forEach((returnFlight) => {
        const returnFlightDate = dayjs(returnFlight.departureDateTime).startOf(
          'day'
        );

        // by construction, this should already be equal to desiredReturnDate,
        // but we can be safe and ensure it's not before outbound
        if (!returnFlightDate.isAfter(outboundFlightDate)) return;

        // calculate non-working days for THIS trip (outbound -> return)
        const { nonWorkingDaysCount, meetsMinNonWorkingDays } =
          countNonWorkingDays(
            outboundFlightDate.format('YYYY-MM-DD'),
            returnFlightDate.format('YYYY-MM-DD'),
            holidays,
            minNonWorkingDays
          );

        // skip trips that don't satisfy the non-working-days constraint
        if (!meetsMinNonWorkingDays) return;

        // If we got here, this is a valid trip option
        foundTrips.push({
          outboundFlight,
          returnFlight,
          totalPrice: outboundFlight.price + returnFlight.price,
          nonWorkingDays: nonWorkingDaysCount,
        });
      });
    });

    // Respond with the valid trips
    return res.json({
      trips: foundTrips,
      tripCount: foundTrips.length,
    });
  } catch (err) {
    console.error('Error in /planTrip:', err);
    return res.status(500).json({ error: 'Server error while planning trip.' });
  }
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
});
