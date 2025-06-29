import { Request, Response, NextFunction } from 'express';

import * as user from '../models/User.model.js';
import * as airline  from '../models/Airline.model.js';
import * as flight from  '../models/Flight.model.js';
import * as ticket from '../models/Ticket.model.js';
import * as route from '../models/Route.model.js';
import * as aircraft from '../models/Aircraft.model.js';

import { sendAirlineApprovalEmail, sendAirlineRejectionEmail, sendReminderEmail, } from '../utils/mailer.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';

// Creo e izializzo il modello per airline

airline.getModel();

// Funzione che elenca tutti gli utenti integrando i dati se si tratta di compagnie aeree

export async function getUsers(req: Request, res: Response, next: NextFunction)  {

  try {
   const rawUsers = await user.getModel()
      .find({}, 'email role name airlineId')
      .populate('airlineId', 'status createdAt');

   const normalized = rawUsers.map(u => {
      const airlineId = u.airlineId as any;             

      return {
        email:     u.email,
        name:      u.name,
        role:      u.role,
        status:    airlineId?.status ?? null,
        createdAt: airlineId?.createdAt ?? null,
      };
    }); 

    res.json(normalized);
  } catch (err) {
  console.error('getUsers error ➜', err);
  next(new AppError('Errore utenti: ' + err.message, 500));
 }
}

// Funzione che restiuisce i dettagli di un particolare utente ricercandolo per email

export async function getDetail(req: Request, res: Response, next: NextFunction) {
  const { email } = req.params;

  try {
    const u = await user.getModel().findOne({ email });
    if (!u) return next(new NotFoundError('Utente'));

    const baseData = { email: u.email, name: u.name, role: u.role };

    // Passeggero o admin: rispondi subito
    if (u.role !== 'airline') {
      return res.json(baseData);
    }

    const airReq = await airline.getModel().findById(u.airlineId);

    // Airline non trovata ⇒ fallback invece di 404
    if (!airReq) {
      return res.json({ ...baseData, status: 'pending' });
    }

    // Ok
    return res.json({
      ...baseData,
      description: airReq.description,
      status: airReq.status,
      createdAt: airReq.createdAt
    });

  } catch (err) {
    next(err instanceof AppError ? err :
         new AppError('Errore interno del server: ' + err.message));
  }
}

// Funzione che approva la richiesta di un compagnia aerea pendente inviando email con password temporanea
// modificando status da pending ad approved


export async function approveAirline(req: Request, res: Response, next: NextFunction) {
  const { email } = req.params;

  try {
    const u = await user.getModel().findOne({ email });
    if (!u || u.role !== 'airline') throw new NotFoundError('Utente non valido o non trovato');
    
    const a = await airline.getModel().findById(u.airlineId);
    if (!a || a.status !== 'pending')  throw new NotFoundError('Richiesta compagnia non trovata o già elaborata');

    const tempPassword = Math.random().toString(36).slice(-8);
    u.setPassword(tempPassword);
    await u.save();

    a.status = 'approved';
    a.createdAt = new Date();
    await a.save();

    try {
      await sendAirlineApprovalEmail(u.email, tempPassword);
    } catch (emailErr) {
      console.error("Errore invio email:", emailErr);
      a.status = 'pending'; // rollback
      await a.save();
    }

    res.json({ message: 'Compagnia approvata', tempPassword });
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Errore durante l'approvazione: " + err.message));
  }
}


// Funzione che rifiuta la richiesta di un compagnia aerea

export async function rejectAirline(req: Request, res: Response, next: NextFunction) {
  const { email } = req.params;

  try {
    const u = await user.getModel().findOne({ email });
    if (!u || u.role !== 'airline') throw new NotFoundError('Utente non valido o non trovato');

    const a = await airline.getModel().findById(u.airlineId);
    if (!a || a.status !== 'pending')  throw new NotFoundError('Richiesta compagnia non trovata o già elaborata');

    a.status = 'rejected';
    await a.save();

    try {
      await sendAirlineRejectionEmail(u.email);
    } catch (emailErr) {
      console.error("Errore invio email:", emailErr);
      // Rollback manuale
      a.status = 'pending';
      await a.save();
    }

    res.json({ message: 'Richiesta rifiutata' });
    } catch (err) {
    next(err instanceof AppError ? err : new AppError("Errore durante il rifiuto: " + err.message));
  }
}

// Funzione che ricorda ad una compagnia aerea di aggiornare la password

export async function sendPasswordChangeReminder(req: Request, res: Response, next: NextFunction) {
  const { email } = req.params;

  try {
    const u = await user.getModel().findOne({ email });
    if (!u || u.role !== 'airline') throw new NotFoundError('Utente compagnia');

    const a = await airline.getModel().findById(u.airlineId);
    if (!a || ['definitive', 'rejected'].includes(a.status))  throw new NotFoundError('Richiesta compagnia non trovata o già elaborata');
    
    if (a.status === 'pending')  throw new AppError('Richiesta deve ancora essere elaborata', 400);
      
    // Invio email per invitare il cambio password
    await sendReminderEmail(u.email, u.name); 
    res.json({ message: 'Email di promemoria inviata' });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("Errore durante l'invio dell'email: " + err.message));
  }
}


// Funzione che cancella un particolare utente ad eccezione di admin

export async function deleteUser(req: Request, res: Response, next: NextFunction) {

  try {
    const email = req.params.email;
    const existingUser = await user.getModel().findOne({ email });

    if (!existingUser) throw new NotFoundError('Utente non trovato');

    if (existingUser.role === 'admin') throw new ForbiddenError("Non è possibile cancellare un utente admin");
    
    // Se l'utente è una compagnia aerea
    if (existingUser.role === 'airline') {
      const airlineId = existingUser.airlineId;

      // Cancella tutti gli aerei associati
      await aircraft.getModel().deleteMany({ airline: airlineId });

      // Cancella tutte le rotte associate
      await route.getModel().deleteMany({ airline: airlineId });

      // Trova tutti i voli della compagnia
      const flightsToDelete = await flight.getModel().find({ airline: airlineId });

      // Estrai gli ID dei voli
      const flightIds = flightsToDelete.map(f => f._id);

      // Cancella i biglietti associati ai voli
      await ticket.getModel().deleteMany({ flight: { $in: flightIds } });

      // Cancella i voli stessi
      await flight.getModel().deleteMany({ _id: { $in: flightIds } });

      // Cancella la compagnia
      await airline.getModel().findByIdAndDelete(airlineId);
    }

    // Cancella utente
    await user.getModel().findByIdAndDelete(existingUser._id);

    res.status(204).send();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError("DB error: " + err.message));
  }
  }
