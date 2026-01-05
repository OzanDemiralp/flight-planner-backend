import 'dotenv/config';

import mongoose from 'mongoose';
import app from './app.js';

const dbUrl = process.env.MONGO_URL;
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl);

mongoose.connection.once('open', () => {
  console.log('Database Connected');
  app.listen(port, () => console.log(`Serving on port ${port}`));
});
