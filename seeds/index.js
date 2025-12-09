import mongoose from 'mongoose';
import { Flight } from '../src/models/Flight.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const dbUrl = process.env.MONGO_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedFlights() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Database Connected');

    const flightsPath = path.join(__dirname, 'flights.json');
    const data = await fs.readFile(flightsPath, 'utf-8');
    const flights = JSON.parse(data);

    console.log(`Read ${flights.length} flights from JSON`);

    await Flight.deleteMany({});
    console.log('Cleared existing flights');

    await Flight.insertMany(flights);
    console.log('Inserted flights successfully');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedFlights();
