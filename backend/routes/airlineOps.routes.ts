import express from 'express';

import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';
import {
  createRoute,
  createAircraft,
  createFlight,
  getAirlineStats,
  getAirline,
  getRoutes,
  getAircrafts,
} from '../controllers/airlineOps.controller.js';


const router = express.Router();

router.use(authenticateJWT, requireRole('airline'));


router.post('/routes',  createRoute);

router.post('/aircrafts', createAircraft);

router.post('/flights', createFlight);

router.get('/stats', getAirlineStats);

router.get('/me', getAirline );

router.get('/routes', getRoutes );

router.get('/aircrafts', getAircrafts );

export default router;