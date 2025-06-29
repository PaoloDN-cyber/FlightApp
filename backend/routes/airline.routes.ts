import express from 'express';

import { body } from 'express-validator';
import { registerAirline } from '../controllers/airline.controller.js';

const router = express.Router();

router.post(
  '/request',
  [
    body('name').notEmpty().withMessage('Il nome è obbligatorio'),
    body('email').isEmail().withMessage('Email non valida'),
    body('description').optional().isString()
  ],
  registerAirline
);


export default router;