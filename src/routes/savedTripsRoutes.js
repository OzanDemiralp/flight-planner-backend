import express from 'express';
import {
  deleteSavedTrips,
  getSavedTrips,
  saveSavedTrips,
} from '../controllers/savedTripsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/saveTrips', requireAuth, saveSavedTrips);
router.get('/savedTrips', requireAuth, getSavedTrips);
router.delete('/deleteSavedTrips', requireAuth, deleteSavedTrips);

export default router;
