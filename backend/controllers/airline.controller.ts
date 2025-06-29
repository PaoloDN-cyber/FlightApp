import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { randomBytes } from 'crypto';

import * as user from '../models/User.model.js';
import * as airline  from '../models/Airline.model.js';

import { BadRequestError } from '../utils/errors.js';


// Funzione che permette ad una compagnia aerea di registrarsi assegnando ruolo airline alla entita, mentre
// lo status pending, impostato per default inzialmente a tutte le compagnie aeree, darà modo ad admin 
// in un secondo momento di notificare una password temporanea alla compagnia registrata 
// in attesa di approvazione o rifiuto 

export async function registerAirline(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError('Dati di input non validi: ' + errors.array().map((e: { msg: any; }) => e.msg).join(', ')));
    }

    const { name, email, description } = req.body;
    

    // Verifica se l'email esiste già come utente
    const existingUser = await user.getModel().findOne({ email });
    if (existingUser) {
      return next(new BadRequestError('Email già in uso'));
    }

    // Crea nuovo documento Airline
    const newAirline = airline.newAirline({ description: description, status: 'pending' });
    const savedAirline = await newAirline.save();

  
    // Password temporane di registrazione in attesa di email da admin con password di avvio
    const password = randomBytes(8).toString('hex');

    // Crea nuovo User collegato alla compagnia
    const newUser = user.newUser({
      name: name,
      email: email,
      role: 'airline',
      airlineId: savedAirline._id,
    });

    newUser.setPassword(password);

    await newUser.save();


    return res.status(201).json({ message: 'Richiesta inviata con successo. In attesa di approvazione.' });
    
    } catch (err) {
    return next(err);
  }
}


