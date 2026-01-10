import express from 'express';
import { saveSavedTrips } from '../controllers/savedTripsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/', requireAuth, saveSavedTrips);

export default router;
