import dayjs from 'dayjs';
import { getTripBounds } from '../../../src/utils/trips/tripBounds.js';

const d = (x) => dayjs(x).format('YYYY-MM-DD');

describe('getTripBounds (vacationLength = nights)', () => {
  test('happy path: computes earliestReturn and latestOutbound', () => {
    const searchWindow = { startDate: '2026-04-20', endDate: '2026-05-20' };
    const vacationLength = 5;

    const { start, end, earliestReturn, latestOutbound, hasRoom } =
      getTripBounds(searchWindow, vacationLength);

    expect(hasRoom).toBe(true);

    expect(d(start)).toBe('2026-04-20');
    expect(d(end)).toBe('2026-05-20');
    expect(d(earliestReturn)).toBe('2026-04-25');
    expect(d(latestOutbound)).toBe('2026-05-15');
  });

  test('only one day possible for outbound and return respectively', () => {
    const searchWindow = { startDate: '2026-04-20', endDate: '2026-04-25' };
    const vacationLength = 5;

    const { earliestReturn, latestOutbound, hasRoom } = getTripBounds(
      searchWindow,
      vacationLength
    );

    expect(hasRoom).toBe(true);
    expect(d(earliestReturn)).toBe('2026-04-25');
    expect(d(latestOutbound)).toBe('2026-04-20');
  });

  test('one day too short: hasRoom=false', () => {
    const searchWindow = { startDate: '2026-05-01', endDate: '2026-05-05' };
    const vacationLength = 5;

    const { hasRoom } = getTripBounds(searchWindow, vacationLength);

    expect(hasRoom).toBe(false);
  });

  test('throws on invalid inputs', () => {
    expect(() =>
      getTripBounds({ startDate: '2026-05-10', endDate: '2026-05-01' }, 5)
    ).toThrow();

    expect(() =>
      getTripBounds({ startDate: '2026-05-01', endDate: '2026-05-10' }, 0)
    ).toThrow();
  });
});
