export default function sortTrips(trips, sortRules) {
  //check whether sortRules is a valid array if not fallback to default sorting rule
  const rules =
    Array.isArray(sortRules) && sortRules.length
      ? sortRules
      : [{ by: 'totalPrice', order: 'asc' }];

  const getSortValue = (trip, by) => {
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
    for (const rule of rules) {
      const aVal = getSortValue(a, rule.by);
      const bVal = getSortValue(b, rule.by);

      if (aVal === bVal) continue;
      if (rule.order === 'asc') {
        return aVal - bVal;
      } else return bVal - aVal;
    }
    // for deterministic behavior always sort by ids at the end so same requests dont result in different sorts
    return String(a.outboundFlight._id).localeCompare(
      String(b.outboundFlight._id)
    );
  });
}
