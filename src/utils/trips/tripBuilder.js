import dayjs from 'dayjs';
import { countNonWorkingDays, holidays } from '../date/countNonWorkingDays.js';

const DAY_UNIT = 'day';

export function buildTrips({
  outboundFlights,
  returnFlights,
  vacationLength,
  minNonWorkingDays,
  end,
  earliestReturn,
}) {
  //map return flights to date -> flight
  const returnFlightsByDate = new Map();
  returnFlights.forEach((flight) => {
    const key = dayjs(flight.departureDateTime)
      .startOf('day')
      .format('YYYY-MM-DD');
    if (!returnFlightsByDate.has(key)) {
      returnFlightsByDate.set(key, []);
    }
    returnFlightsByDate.get(key).push(flight);
  });

  //this array of trips will be returned eventually
  const foundTrips = [];

  //match the outbound flights with corresponding return flights
  outboundFlights.forEach((outboundFlight) => {
    const outboundDate = dayjs(outboundFlight.departureDateTime).startOf('day');

    //calcukate desired return date based on vacationLength
    const desiredReturnDate = outboundDate.add(vacationLength, DAY_UNIT);

    // validation
    if (
      desiredReturnDate.isBefore(earliestReturn) ||
      desiredReturnDate.isAfter(end)
    ) {
      return;
    }

    //see whether there are candidate return flights for the outbound flight
    const key = desiredReturnDate.format('YYYY-MM-DD');
    const candidates = returnFlightsByDate.get(key);
    if (!candidates || candidates.length === 0) return;

    //if there are, chekch whether outbound-return pair satsifies non work days requirement
    candidates.forEach((returnFlight) => {
      const returnDate = dayjs(returnFlight.departureDateTime).startOf('day');

      if (!returnDate.isAfter(outboundDate)) return;

      const { nonWorkingDaysCount, meetsMinNonWorkingDays } =
        countNonWorkingDays(
          outboundDate.format('YYYY-MM-DD'),
          returnDate.format('YYYY-MM-DD'),
          holidays,
          minNonWorkingDays
        );

      if (!meetsMinNonWorkingDays) return;

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
