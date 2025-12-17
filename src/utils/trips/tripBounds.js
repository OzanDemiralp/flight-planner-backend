import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

const DAY_UNIT = 'day';

export function getTripBounds(searchWindow, vacationLength) {
  //destructure searchwindow
  const { startDate, endDate } = searchWindow;

  const start = dayjs.utc(startDate).startOf('day');
  const end = dayjs.utc(endDate).startOf('day');

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
