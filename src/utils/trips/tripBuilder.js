import dayjs from 'dayjs';
import { countNonWorkingDays } from '../date/countNonWorkingDays.js';
import { TR_HOLIDAYS_2026 } from '../date/holidays.js';

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

const checkNonWorkingDays = (outboundDate, returnDate, minNonWorkingDays) => {
  const { nonWorkingDaysCount, meetsMinNonWorkingDays } = countNonWorkingDays(
    outboundDate.format('YYYY-MM-DD'),
    returnDate.format('YYYY-MM-DD'),
    TR_HOLIDAYS_2026,
    minNonWorkingDays
  );
  return {
    ok: meetsMinNonWorkingDays,
    nonWorkingDaysCount,
  };
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

      const { ok, nonWorkingDaysCount } = checkNonWorkingDays(
        outboundDate,
        returnDate,
        minNonWorkingDays
      );

      if (!ok) return;

      //if here then it is a valid outbound-return pair therefore a valid trip
      foundTrips.push({
        outboundFlight,
        returnFlight,
        totalPrice: outboundFlight.price + returnFlight.price,
        nonWorkingDays: nonWorkingDaysCount,
      });
    });
  });
  return foundTrips;
}
