import tripExplanation from '../../../src/utils/trips/tripExplanation.js';

const holidays = ['2026-05-01T00:00:00Z', '2026-05-19T00:00:00Z'];

describe('tripExplanation', () => {
  test('counts valid weekends in a holiday-free time window', () => {
    const { nonWorkingDates, nonWorkingDaysCount } = tripExplanation(
      '2026-05-02',
      '2026-05-13',
      holidays
    );

    expect(nonWorkingDaysCount).toBe(4);
  });

  test('counts holidays at weekdays', () => {
    const { nonWorkingDates } = tripExplanation(
      '2026-04-30',
      '2026-05-20',
      holidays
    );

    expect(nonWorkingDates).toContain('2026-05-01');
    expect(nonWorkingDates).toContain('2026-05-19');
  });

  test('counts one single day when return and outbound are on the same day', () => {
    const { totalDays, nonWorkingDaysCount } = tripExplanation(
      '2026-05-02',
      '2026-05-02',
      []
    );

    expect(totalDays).toBe(1);
    expect(nonWorkingDaysCount).toBe(1);
  });

  test('counts only once when weekends and holidays overlap', () => {
    const { nonWorkingDates, nonWorkingDaysCount } = tripExplanation(
      '2026-05-03',
      '2026-05-05',
      ['2026-05-03']
    );

    expect(nonWorkingDaysCount).toBe(1);
    expect(nonWorkingDates).toEqual(['2026-05-03']);
  });

  test('returns zero non-working days when range contains only weekdays and no holidays', () => {
    const { nonWorkingDaysCount, nonWorkingDates } = tripExplanation(
      '2026-05-04',
      '2026-05-08',
      []
    );

    expect(nonWorkingDaysCount).toBe(0);
    expect(nonWorkingDates).toEqual([]);
  });
});

// npm test -- __tests__/utils/trips
