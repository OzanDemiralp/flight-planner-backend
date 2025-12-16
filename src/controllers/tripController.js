import { getTripBounds } from '../utils/trips/tripBounds.js';
import { getCandidateFlights } from '../utils/trips/tripFlights.js';
import { buildTrips } from '../utils/trips/buildTrips.js';
import sortTrips from '../utils/trips/sortTrips.js';
import filterTrips from '../utils/trips/filterTrips.js';

export const planTrip = async (req, res) => {
  // destructure req body
  const {
    departureFrom,
    departureTo,
    returnFrom,
    returnTo,
    minNonWorkingDays,
    vacationLength,
    searchWindow,
    filters,
    sort,
  } = req.body;

  //calculate bounds for trips to be searched
  const { start, end, latestOutbound, earliestReturn, hasRoom } = getTripBounds(
    searchWindow,
    vacationLength
  );

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

  let trips = buildTrips({
    outboundFlights,
    returnFlights,
    vacationLength,
    minNonWorkingDays,
    end,
    earliestReturn,
  });
  trips = filterTrips(trips, filters);
  trips = sortTrips(trips, sort);
  //respond with valid trips
  return res.json({
    trips,
    tripCount: trips.length,
  });
};
