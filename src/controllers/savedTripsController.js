import mongoose from 'mongoose';
import SavedTrip from '../models/savedTrip.js';
import dayjs from 'dayjs';
import tripExplanation from '../utils/trips/tripExplanation.js';
import { TR_HOLIDAYS_2026 } from '../utils/date/holidays.js';

const makeTripId = (outId, retId) => `${outId}_${retId}`;

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

export async function getSavedTrips(req, res, next) {
  try {
    const ownerId = req.user._id;

    const savedTrips = await SavedTrip.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .populate('outboundFlight')
      .populate('returnFlight')
      .lean();

    const trips = savedTrips
      .filter((s) => s.outboundFlight && s.returnFlight)
      .map((s) => {
        const out = s.outboundFlight;
        const ret = s.returnFlight;

        const outboundDate = dayjs.utc(out.departureDateTime).startOf('day');
        const returnDate = dayjs.utc(ret.departureDateTime).startOf('day');

        const details = tripExplanation(
          outboundDate,
          returnDate,
          TR_HOLIDAYS_2026
        );

        return {
          id: makeTripId(String(out._id), String(ret._id)),
          outboundFlight: out,
          returnFlight: ret,
          totalPrice: (out.price ?? 0) + (ret.price ?? 0),
          details,
        };
      });

    return res.status(200).json({ trips });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedTrips(req, res, next) {
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

    const or = pairs.map(({ outId, retId }) => ({
      outboundFlight: outId,
      returnFlight: retId,
    }));

    const result = await SavedTrip.deleteMany({
      owner: userId,
      $or: or,
    });

    return res.status(200).json({
      message: 'Saved trips deleted',
      requested: tripIds.length,
      valid: pairs.length,
      deleted: result.deletedCount ?? 0,
    });
  } catch (err) {
    return next(err);
  }
}
