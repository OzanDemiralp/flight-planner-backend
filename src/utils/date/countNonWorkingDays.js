import dayjs from 'dayjs';

export const holidays = [
  '2026-01-01',
  '2026-04-23',
  '2026-05-01',
  '2026-05-19',
  '2026-07-15',
  '2026-08-30',
  '2026-10-29',
];

export function countNonWorkingDays(
  startDate,
  endDate,
  holidaysArray,
  minNonWorkingDays
) {
  // normalize start/end to dates
  let current = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  // normalize holidays to "YYYY-MM-DD" and put in a set
  const holidaySet = new Set(
    holidaysArray.map((d) => dayjs(d).format('YYYY-MM-DD'))
  );

  let nonWorkingDaysCount = 0;

  // loop from start to end
  while (current.isSame(end) || current.isBefore(end)) {
    const isWeekend = current.day() === 0 || current.day() === 6; // sunday = 0 saturday = 6
    const isHoliday = holidaySet.has(current.format('YYYY-MM-DD'));

    if (isWeekend || isHoliday) {
      nonWorkingDaysCount++;
    }

    current = current.add(1, 'day');
  }
  return {
    nonWorkingDaysCount,
    meetsMinNonWorkingDays: nonWorkingDaysCount >= minNonWorkingDays,
  };
}

//console.log(countNonWorkingDays('2026-05-15', '2026-05-20', holidays, 3));
