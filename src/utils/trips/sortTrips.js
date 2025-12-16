export default function sortTrips(trips, sort) {
  const { by, order } = sort;

  const getSortValue = (trip) => {
    switch (by) {
      case 'totalPrice':
        return trip.totalPrice;

      case 'workDaysUsed':
        return trip.details.workDaysUsed;

      case 'nonWorkingDaysCount':
        return trip.details.nonWorkingDaysCount;

      default:
        return 0;
    }
  };

  return [...trips].sort((a, b) => {
    const aVal = getSortValue(a);
    const bVal = getSortValue(b);

    if (order === 'asc') {
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    } else {
      if (aVal > bVal) return -1;
      if (aVal < bVal) return 1;
      return 0;
    }
  });
}
