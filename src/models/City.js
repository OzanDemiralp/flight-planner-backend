import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CitySchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Flight = mongoose.model('City', CitySchema);
