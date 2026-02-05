import 'dotenv/config';

import mongoose from 'mongoose';
import app from './app.js';

const dbUrl = process.env.MONGO_URL;
const port = process.env.PORT || 3000;

mongoose.set('sanitizeFilter', true);

mongoose.connect(dbUrl).catch((err) => {
  console.error('Mongo connection error:', err);
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongo runtime error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Database Connected');
  app.listen(port, () => console.log(`Serving on port ${port}`));
});
