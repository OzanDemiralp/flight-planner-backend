import dayjs from 'dayjs';
import { TR_HOLIDAYS_2026 } from '../date/holidays.js';
import tripExplanation from './tripExplanation.js';

const groupFlightsByDay = (flights) => {
  const flightsByDate = new Map();
  flights.forEach((flight) => {
    const key = dayjs(flight.departureDateTime)
      .startOf('day')
      .format('YYYY-MM-DD');
    if (!flightsByDate.has(key)) {
      flightsByDate.set(key, []);
    }
    flightsByDate.get(key).push(flight);
  });
  return flightsByDate;
};

export function buildTrips({
  outboundFlights,
  returnFlights,
  vacationLength,
  minNonWorkingDays,
}) {
  //group return flights as 'date -> flight' for performance
  const returnFlightsByDate = groupFlightsByDay(returnFlights);

  //this array of trips will be returned eventually
  const foundTrips = [];

  //match the outbound flights with corresponding return flights
  outboundFlights.forEach((outboundFlight) => {
    const outboundDate = dayjs(outboundFlight.departureDateTime).startOf('day');

    //calculate desired return date based on vacationLength
    const desiredReturnDate = outboundDate.add(vacationLength, 'day');

    //see whether there are candidate return flights for the outbound flight
    const key = desiredReturnDate.format('YYYY-MM-DD');
    const candidates = returnFlightsByDate.get(key);
    if (!candidates || candidates.length === 0) return;

    //if there are, check whether outbound-return pair satsifies non work days requirement
    candidates.forEach((returnFlight) => {
      const returnDate = dayjs(returnFlight.departureDateTime).startOf('day');

      if (!returnDate.isAfter(outboundDate)) return;

      const explanation = tripExplanation(
        outboundDate,
        returnDate,
        TR_HOLIDAYS_2026
      );

      //validate whether trip meets requested minNonWorkingDays
      if (explanation.nonWorkingDaysCount < minNonWorkingDays) return;

      //if here then it is a valid outbound-return pair therefore a valid trip
      foundTrips.push({
        outboundFlight,
        returnFlight,
        totalPrice: outboundFlight.price + returnFlight.price,
        details: explanation,
      });
    });
  });
  return foundTrips;
}
