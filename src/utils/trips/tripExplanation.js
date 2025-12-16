import dayjs from 'dayjs';

export default function tripExplanation(
  outboundDate,
  returnDate,
  holidaysArray
) {
  let current = dayjs(outboundDate).startOf('day');
  const end = dayjs(returnDate).startOf('day');

  const holidaySet = new Set(
    holidaysArray.map((d) => dayjs(d).format('YYYY-MM-DD'))
  );

  const nonWorkingDates = [];
  const vacationDates = [];

  while (current.isSame(end) || current.isBefore(end)) {
    const currentDate = current.format('YYYY-MM-DD');
    const isWeekend = current.day() === 0 || current.day() === 6;
    const isHoliday = holidaySet.has(currentDate);

    if (isWeekend || isHoliday) {
      nonWorkingDates.push(currentDate);
    } else vacationDates.push(currentDate);

    current = current.add(1, 'day');
  }
  return {
    nonWorkingDates,
    vacationDates,
    nonWorkingDaysCount: nonWorkingDates.length,
    vacationDaysUsed: vacationDates.length,
    totalDays: nonWorkingDates.length + vacationDates.length,
  };
}
