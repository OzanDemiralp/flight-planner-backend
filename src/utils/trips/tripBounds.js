import dayjs from 'dayjs';

const DAY_UNIT = 'day';

export function getTripBounds(searchWindow, vacationLength) {
  //destructure searchwindow
  const { startDate, endDate } = searchWindow;

  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  //quick validations
  if (end.isBefore(start)) {
    throw new Error('endDate must be after startDate');
  }
  if (!Number.isInteger(vacationLength) || vacationLength < 1) {
    throw new Error('vacationLength must be >= 1');
  }

  //calculate earliest possible return and latest possible outbound according to search window
  const latestOutbound = end.subtract(vacationLength, DAY_UNIT);
  const earliestReturn = start.add(vacationLength, DAY_UNIT);

  //validate
  const hasRoom = !(
    latestOutbound.isBefore(start) || earliestReturn.isAfter(end)
  );

  return {
    start,
    end,
    latestOutbound,
    earliestReturn,
    hasRoom,
  };
}
