import express from 'express';

import { purchaseTickets, checkSeatAvailability, bookSingleSeat, listMyBookings, sendConfirmationEmail} from '../controllers/ticket.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();
 
router.use(authenticateJWT,  (req, res, next) => {
  console.log('→ [Middleware] req.user in tickets route =', req.user);
  next();
}, requireRole('passenger'));

router.get('/seat-map/:flightId', checkSeatAvailability);

router.post('/book/:flightId', bookSingleSeat);

router.post('/purchase', purchaseTickets);

router.get('/myBookings',listMyBookings);

router.post('/sendConfirmation', sendConfirmationEmail);

export default router;