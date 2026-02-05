import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FlightSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureDateTime: { type: Date, required: true },
  arrivalDateTime: { type: Date, required: true },
  price: { type: Number, required: true },
});

const Flight = mongoose.model('Flight', FlightSchema);

export default Flight;
