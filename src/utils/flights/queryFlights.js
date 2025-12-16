import Flight from '../../models/flight.js';

export async function getCandidateFlights({
  departureFrom,
  departureTo,
  returnFrom,
  returnTo,
  start,
  end,
  latestOutbound,
  earliestReturn,
}) {
  //query mongo
  const outboundFlights = await Flight.find({
    from: departureFrom,
    to: departureTo,
    departureDateTime: {
      $gte: start.toDate(),
      $lte: latestOutbound.toDate(),
    },
  });
  const returnFlights = await Flight.find({
    from: returnFrom,
    to: returnTo,
    departureDateTime: {
      $gte: earliestReturn.toDate(),
      $lte: end.toDate(),
    },
  });

  return { outboundFlights, returnFlights };
}
