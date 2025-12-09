import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TripSchema = new Schema({
  outboundFlight: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  returnFlight: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
});

export const Trip = mongoose.model('Trip', TripSchema);
