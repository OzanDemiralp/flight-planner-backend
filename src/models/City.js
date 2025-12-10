import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CitySchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  country: String,
});

City = mongoose.model('City', CitySchema);

export default City;
