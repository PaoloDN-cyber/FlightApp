import express from 'express';

import { registerPassenger, login, changePassword } from '../controllers/auth.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerPassenger);

router.post('/login', login);

router.post('/change-password', authenticateJWT, requireRole('airline'), changePassword);

export default router;