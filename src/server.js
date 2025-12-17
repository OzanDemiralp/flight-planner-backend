import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const dbUrl = process.env.MONGO_URL;
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
  app.listen(port, () => console.log(`Serving on port ${port}`));
});
