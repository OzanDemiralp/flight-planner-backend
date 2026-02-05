import mongoose from 'mongoose';

const { Schema } = mongoose;

const SavedTripSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

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
  },
  { timestamps: true }
);

SavedTripSchema.index(
  { owner: 1, outboundFlight: 1, returnFlight: 1 },
  { unique: true, name: 'uniq_owner_out_ret' }
);

SavedTripSchema.index({ owner: 1, createdAt: -1 }, { name: 'owner_createdAt' });

const SavedTrip = mongoose.model('SavedTrip', SavedTripSchema);
export default SavedTrip;
