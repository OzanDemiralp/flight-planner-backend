# Flight Planner Backend (WIP)

Backend service for a vacation-oriented flight planner.
This backend focuses on core trip-planning logic and exposes an API
to find valid outbound–return flight combinations based on vacation length
and non-working days.

> This project is a work in progress.  
> Frontend, authentication, session handling, and trip persistence
> will be implemented in later stages.

## What This Backend Does

- Matches outbound and return flights using a day-based vacation model
- Calculates non-working days (weekends + holidays)
- Filters trips based on minimum non-working day requirements
- Returns valid trip combinations with pricing and detailed explanations

## Tech Stack

- Node.js (ES Modules)
- Express
- MongoDB with Mongoose
- Day.js
- Joi
- Jest & Supertest (unit and integration testing)

## Project Structure (Simplified)

```
src/
  controllers/
  models/
  middleware/
  utils/
    trips/
    date/
__tests__/
  utils/
  integration/
```

## API

### POST /planTrip

Plans valid trips for a given search window.

Example request payload:

```json
{
  "departureFrom": "IST",
  "departureTo": "SJJ",
  "returnFrom": "VIE",
  "returnTo": "IST",

  "vacationLength": 5,
  "minNonWorkingDays": 2,

  "searchWindow": {
    "startDate": "2026-05-01",
    "endDate": "2026-05-20"
  },

  "filters": {
    "maxTotalPrice": 400,
    "maxWorkDaysUsed": 4
  },

  "sort": [
    { "by": "workDaysUsed", "order": "asc" },
    { "by": "totalPrice", "order": "asc" }
  ]
}
```

Response includes:

- `trips`: array of valid outbound/return combinations
- `tripCount`: number of valid trips found

## Running Locally

```bash
npm install
npm run dev
```

## Running Tests

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- path/to/testfile.js
```

## Important Note

- The backend currently uses seeded mock flight data to focus on core trip-planning logic.
- All date calculations are handled in UTC to avoid timezone-related bugs.
- Core trip-planning logic is covered by unit tests.
- API behavior and wiring are covered by integration tests using
  an in-memory MongoDB instance.

## Planned Next Steps

- Frontend implementation
- Authentication and session management
- Saving and managing user trips
- User-specific trip history
