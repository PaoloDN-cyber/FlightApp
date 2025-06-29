import express from 'express';

import { searchFlights, getFlightById } from '../controllers/flightSearch.controller.js';

const router = express.Router();

router.get('/search', searchFlights);

router.get('/:id', getFlightById);

export default router;