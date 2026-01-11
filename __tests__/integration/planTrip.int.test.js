//npm test -- __tests__/integration/planTrip.int.test.js

import request from 'supertest';
import app from '../../src/app.js';
import Flight from '../../src/models/flight.js';

describe('POST/planTrip integration test', () => {
  let agent;

  beforeEach(async () => {
    agent = request.agent(app);

    await agent
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@mail.com', password: '123456' });
    await agent.post('/auth/login').send({
      email: 'test@mail.com',
      password: '123456',
    });
  });

  test('happy path returns trips when flights match', async () => {
    await Flight.create([
      {
        from: 'IST',
        to: 'SJJ',
        departureDateTime: new Date('2026-05-01T08:00:00.000Z'),
        arrivalDateTime: new Date('2026-05-01T10:00:00.000Z'),
        price: 130,
      },
      {
        from: 'VIE',
        to: 'IST',
        departureDateTime: new Date('2026-05-06T08:00:00.000Z'),
        arrivalDateTime: new Date('2026-05-06T10:00:00.000Z'),
        price: 70,
      },
    ]);

    const requestPayload = {
      departureFrom: 'IST',
      departureTo: 'SJJ',
      returnFrom: 'VIE',
      returnTo: 'IST',
      minNonWorkingDays: 2,
      vacationLength: 5,
      searchWindow: { startDate: '2026-05-01', endDate: '2026-05-31' },
    };

    const response = await agent.post('/planTrip').send(requestPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('trips');
    expect(Array.isArray(response.body.trips)).toBe(true);
    expect(response.body.trips.length).toBeGreaterThan(0);
    expect(response.body.tripCount).toBe(response.body.trips.length);
    expect(response.body.trips[0].totalPrice).toBe(200);
    expect(response.body.trips[0]).toEqual(
      expect.objectContaining({
        outboundFlight: expect.objectContaining({
          from: 'IST',
          to: 'SJJ',
        }),
        returnFlight: expect.objectContaining({
          from: 'VIE',
          to: 'IST',
        }),
        totalPrice: expect.any(Number),
        details: expect.any(Object),
      })
    );
  });

  test('returns empty trips when no matching return flight on desired date', async () => {
    await Flight.create([
      {
        from: 'IST',
        to: 'SJJ',
        departureDateTime: new Date('2026-05-01T08:00:00.000Z'),
        arrivalDateTime: new Date('2026-05-01T10:00:00.000Z'),
        price: 130,
      },
      {
        from: 'VIE',
        to: 'IST',
        departureDateTime: new Date('2026-05-07T08:00:00.000Z'), // desired return date shouldve been may 6th
        arrivalDateTime: new Date('2026-05-07T10:00:00.000Z'),
        price: 70,
      },
    ]);

    const requestPayload = {
      departureFrom: 'IST',
      departureTo: 'SJJ',
      returnFrom: 'VIE',
      returnTo: 'IST',
      minNonWorkingDays: 0,
      vacationLength: 5,
      searchWindow: { startDate: '2026-05-01', endDate: '2026-05-31' },
    };

    const response = await agent.post('/planTrip').send(requestPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.trips).toEqual([]);
    expect(response.body.tripCount).toBe(0);
  });

  test('fails validation when payload is missing required fields', async () => {
    const response = await agent.post('/planTrip').send({
      vacationLength: 5,
    });

    expect([400, 422]).toContain(response.statusCode);
  });
});
