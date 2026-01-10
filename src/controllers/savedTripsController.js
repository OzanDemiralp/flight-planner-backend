import mongoose from 'mongoose';
import SavedTrip from '../models/savedTrip.js';

const parseTripId = (tripId) => {
  if (typeof tripId !== 'string') return null;
  const [outId, retId] = tripId.split('_');
  if (!outId || !retId) return null;
  if (!mongoose.isValidObjectId(outId) || !mongoose.isValidObjectId(retId))
    return null;
  return { outId, retId };
};

export async function saveSavedTrips(req, res, next) {
  try {
    const userId = req.user._id;

    const { tripIds } = req.body;
    if (!Array.isArray(tripIds) || tripIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'tripIds must be a non-empty array' });
    }

    const pairs = [];
    const seen = new Set();

    for (const t of tripIds) {
      const parsed = parseTripId(t);
      if (!parsed) continue;

      const key = `${parsed.outId}_${parsed.retId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      pairs.push(parsed);
    }

    if (pairs.length === 0) {
      return res.status(400).json({ message: 'No valid tripIds provided' });
    }

    const ops = pairs.map(({ outId, retId }) => ({
      updateOne: {
        filter: { owner: userId, outboundFlight: outId, returnFlight: retId },
        update: {
          $setOnInsert: {
            owner: userId,
            outboundFlight: outId,
            returnFlight: retId,
          },
        },
        upsert: true,
      },
    }));

    const result = await SavedTrip.bulkWrite(ops, { ordered: false });

    return res.status(200).json({
      message: 'Saved trips processed',
      requested: tripIds.length,
      inserted: result.upsertedCount ?? 0,
      matched: result.matchedCount ?? 0,
    });
  } catch (err) {
    return next(err);
  }
}
