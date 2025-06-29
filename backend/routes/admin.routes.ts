import express from 'express';

import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';
import { getUsers, getDetail, approveAirline, 
         rejectAirline, sendPasswordChangeReminder, deleteUser } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticateJWT, requireRole('admin'));

router.get('/users', getUsers);

router.get('/user-detail/:email', getDetail );

router.patch('/approve-airline/:email', approveAirline);

router.patch('/reject-airline/:email', rejectAirline);

router.post('/send-reminder/:email', sendPasswordChangeReminder );

router.delete('/users/:email', deleteUser);

export default router