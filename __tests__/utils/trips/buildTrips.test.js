import { jest } from '@jest/globals';

const tripExplanationMock = jest.fn();

jest.unstable_mockModule('../../../src/utils/trips/tripExplanation.js', () => ({
  default: tripExplanationMock,
}));

const { buildTrips } = await import('../../../src/utils/trips/buildTrips.js');

const flight = ({ dep, price = 100 }) => ({
  departureDateTime: dep,
  price,
});

describe('buildTrips', () => {
  beforeEach(() => {
    tripExplanationMock.mockReset();
  });

  test('returns empty when no return flight exists on desired return date', () => {
    tripExplanationMock.mockReturnValue({ nonWorkingDaysCount: 999 });

    const outboundFlights = [
      flight({ dep: '2026-05-01T22:00:00.000Z', price: 50 }),
    ];
    const returnFlights = [
      flight({ dep: '2026-05-07T08:00:00.000Z', price: 70 }),
    ]; //desiredReturnDate = 2026-05-06 when vacationLength=5, so this is not a desired return date

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength: 5,
      minNonWorkingDays: 0,
    });

    expect(trips).toEqual([]);
    expect(tripExplanationMock).not.toHaveBeenCalled();
  });

  test('happy path returns valid trips when there are matching flights', () => {
    tripExplanationMock.mockReturnValue({ nonWorkingDaysCount: 3 });

    const outboundFlights = [
      flight({ dep: '2026-05-01T22:00:00.000Z', price: 50 }),
    ];
    const returnFlights = [
      flight({ dep: '2026-05-06T08:00:00.000Z', price: 70 }),
    ];

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength: 5,
      minNonWorkingDays: 3,
    });

    expect(trips).toHaveLength(1);
    expect(trips[0].outboundFlight).toBe(outboundFlights[0]);
    expect(trips[0].returnFlight).toBe(returnFlights[0]);
    expect(trips[0].totalPrice).toBe(120);
    expect(trips[0].details).toEqual({ nonWorkingDaysCount: 3 });

    expect(tripExplanationMock).toHaveBeenCalledTimes(1);
  });

  test('returns valid trips when there are more than one matching flight per day', () => {
    tripExplanationMock.mockReturnValue({ nonWorkingDaysCount: 3 });

    const outboundFlights = [
      flight({ dep: '2026-05-01T12:00:00.000Z', price: 50 }),
      flight({ dep: '2026-05-01T22:00:00.000Z', price: 60 }),
    ];
    const returnFlights = [
      flight({ dep: '2026-05-06T08:00:00.000Z', price: 70 }),
      flight({ dep: '2026-05-06T18:00:00.000Z', price: 55 }),
    ];

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength: 5,
      minNonWorkingDays: 3,
    });

    expect(trips).toHaveLength(4);
    expect(trips).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          outboundFlight: expect.objectContaining({
            departureDateTime: '2026-05-01T12:00:00.000Z',
          }),
          returnFlight: expect.objectContaining({
            departureDateTime: '2026-05-06T08:00:00.000Z',
          }),
        }),
        expect.objectContaining({
          outboundFlight: expect.objectContaining({
            departureDateTime: '2026-05-01T12:00:00.000Z',
          }),
          returnFlight: expect.objectContaining({
            departureDateTime: '2026-05-06T18:00:00.000Z',
          }),
        }),
        expect.objectContaining({
          outboundFlight: expect.objectContaining({
            departureDateTime: '2026-05-01T22:00:00.000Z',
          }),
          returnFlight: expect.objectContaining({
            departureDateTime: '2026-05-06T08:00:00.000Z',
          }),
        }),
        expect.objectContaining({
          outboundFlight: expect.objectContaining({
            departureDateTime: '2026-05-01T22:00:00.000Z',
          }),
          returnFlight: expect.objectContaining({
            departureDateTime: '2026-05-06T18:00:00.000Z',
          }),
        }),
      ])
    );
    expect(tripExplanationMock).toHaveBeenCalledTimes(4);
  });

  test('filters trips by minNonWorkingDays boundary (>= passes, < fails)', () => {
    tripExplanationMock
      .mockReturnValueOnce({ nonWorkingDaysCount: 2 }) //fail
      .mockReturnValueOnce({ nonWorkingDaysCount: 3 }); //pass

    const outboundFlights = [
      flight({ dep: '2026-05-01T12:00:00.000Z', price: 40 }),
    ];
    const returnFlights = [
      flight({ dep: '2026-05-06T08:00:00.000Z', price: 60 }),
      flight({ dep: '2026-05-06T20:00:00.000Z', price: 80 }),
    ];

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength: 5,
      minNonWorkingDays: 3,
    });

    expect(trips).toHaveLength(1);
    expect(trips[0].returnFlight).toBe(returnFlights[1]);
    expect(trips[0].totalPrice).toBe(120);
    expect(tripExplanationMock).toHaveBeenCalledTimes(2);
  });

  test('passes when nonWorkingDaysCount equals minNonWorkingDays (boundary case)', () => {
    tripExplanationMock.mockReturnValue({ nonWorkingDaysCount: 3 });

    const outboundFlights = [
      flight({ dep: '2026-05-01T10:00:00.000Z', price: 40 }),
    ];
    const returnFlights = [
      flight({ dep: '2026-05-06T10:00:00.000Z', price: 60 }),
    ];

    const trips = buildTrips({
      outboundFlights,
      returnFlights,
      vacationLength: 5,
      minNonWorkingDays: 3,
    });

    expect(trips).toHaveLength(1);
    expect(trips[0].totalPrice).toBe(100);
    expect(tripExplanationMock).toHaveBeenCalledTimes(1);
  });
});
