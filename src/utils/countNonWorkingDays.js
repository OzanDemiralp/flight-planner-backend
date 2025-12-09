holidays = [
  '2026-01-01',
  '2026-04-23',
  '2026-05-01',
  '2026-05-19',
  '2026-07-15',
  '2026-08-30',
  '2026-10-29',
];

function countNonWorkingDays(startDate, endDate, holidays, minNonWorkingDays) {
  let nonWorkingDaysCount = 0;
  holidays = holidays.map((d) => new Date(d));

  for (
    let current = new Date(startDate);
    current <= new Date(endDate);
    current.setDate(current.getDate() + 1)
  ) {
    const day = current.getDay();
    const isWeekend = day === 0 || day === 6; // sunday 0 saturday 6

    const isHoliday = holidays.some(
      (h) =>
        h.getFullYear() === current.getFullYear() &&
        h.getMonth() === current.getMonth() &&
        h.getDate() === current.getDate()
    );
    if (isWeekend || isHoliday) {
      nonWorkingDaysCount++;
    }
  }
  return {
    nonWorkingDaysCount,
    meetsMinNonWorkingDays: nonWorkingDaysCount >= minNonWorkingDays,
  };
}

console.log(countNonWorkingDays('2026-05-15', '2026-05-20', holidays, 3));
