export default function filterTrips(trips, filters) {
  const { maxTotalPrice, maxWorkDaysUsed } = filters;
  return trips.filter((trip) => {
    if (maxTotalPrice && trip.totalPrice > maxTotalPrice) {
      return false;
    }

    if (maxWorkDaysUsed && trip.details.workDaysUsed > maxWorkDaysUsed) {
      return false;
    }

    return true;
  });
}
