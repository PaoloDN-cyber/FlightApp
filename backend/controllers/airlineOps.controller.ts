import { Request, Response, NextFunction } from 'express';

import { RouteInput, Route, newRoute, getModel as getRouteModel } from '../models/Route.model.js';
import { Aircraft, newAircraft, AircraftInput, getModel as getAircraftModel } from '../models/Aircraft.model.js';
import { FlightInput, newFlight, getModel as getFlightModel  } from '../models/Flight.model.js';
import { getModel as getAirlineModel } from '../models/Airline.model.js';

import { BadRequestError, NotFoundError, AppError } from '../utils/errors.js';
import { Document, Types } from 'mongoose';

// Creo e izializzo i modelli per Route e Aircraft

getRouteModel();  
getAircraftModel();

// Serie di interfacce di supporto per tipizzare i dati in ingresso

export interface AuthenticatedUser {
  id: Types.ObjectId; role: string; mail: string; name:string; status: string; airlineId: Types.ObjectId; 
}

export interface Payload extends Request {user: AuthenticatedUser }

export interface CreateRoute extends Request {
  user: AuthenticatedUser;
  body: RouteInput;
}

export interface CreateAircraft extends Request {
  user: AuthenticatedUser;
  body: AircraftInput;
}

export interface CreateFlight extends Request {
  user: AuthenticatedUser;
  body: FlightInput;
}


//=== CREAZIONE ROTTA ===
export async function createRoute(
  req: CreateRoute,
  res: Response,
  next: NextFunction
) {
  try {
    const { from, to } = req.body;  // estrapolato dal body
    const airlineId = req.user.airlineId; // estrapolato dal token

    if (!from || !to) {
      throw new BadRequestError('Campi "from" e "to" obbligatori');
    }

    const route = newRoute({ from, to, airlineId });
    await route.save();

    return res.status(201).json(route);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new BadRequestError('Route già esistente'));
    }
    next(err);
  }
}

// === CREAZIONE AEREO ===
export async function createAircraft(
  req: CreateAircraft,
  res: Response,
  next: NextFunction
) {
  try {
    const { pattern, totalSeats } = req.body;  // estrapolato dal body
    const airlineId = req.user.airlineId;   // estrapolato dal token

    if (!pattern || typeof totalSeats !== 'number' || totalSeats <= 0) {
      throw new BadRequestError('Modello o numero posti non validi');
    }

    const aircraft = newAircraft({ pattern, totalSeats, airlineId });
    await aircraft.save();

    return res.status(201).json(aircraft);
  } catch (err) {
    next(err);
  }
}


// === CREAZIONE VOLO ===
export async function createFlight(
  req: CreateFlight,
  res: Response,
  next: NextFunction
) {
  try {
    const { route, aircraft, departureTime, arrivalTime, price } = req.body;

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);


    const a = await getAircraftModel().findById(aircraft);
    if (!a) throw new NotFoundError('Aereo non trovato');

    if (departure >= arrival) {
      throw new BadRequestError('Orario di arrivo deve essere dopo la partenza');
    }

    if (!price || typeof price.economy !== 'number') {
      throw new BadRequestError('Prezzo economy mancante o non valido');
    }

    const flightDoc = newFlight({
      route: route,
      aircraft: aircraft,
      departureTime: departure,
      arrivalTime: arrival,
      price: price,
      availableSeats: a.totalSeats,
    });

    await flightDoc.save();
    return res.status(201).json(flightDoc);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new BadRequestError('Volo già esistente')); 
    }
    next(err);
  }
}

// === STATISTICHE COMPAGNIA ===
export async function getAirlineStats(
  req: Payload,
  res: Response,
  next: NextFunction
) {
  try {
    const  airlineId  = req.user.airlineId;
    
  // Carica tutti i voli e popola route e aircraft

  const Flight = getFlightModel();   
  const flights = await Flight.find()
      .populate({
        path: 'route',
        match: { airlineId: airlineId },
        select: 'from to', // Evita di caricare campi inutili
      })
      .populate({
        path: 'aircraft',
        select: 'totalSeats',
      }).
      lean();

     const stats = {
      totalPassengers: 0,
      totalRevenue: 0,
      routesDemand: {} as Record<string, number>,
    };
    for (const f of flights) {
      // Se la route non è della compagnia, sarà null per via del match
      if (!f.route || !f.aircraft) continue;
     
      const aircraft = f.aircraft as unknown as (Document & Aircraft);
      const route = f.route as unknown as (Document & Route);
     
      const sold = aircraft.totalSeats - f.availableSeats;
      stats.totalPassengers += sold;
      stats.totalRevenue += sold * f.price.economy;

      const key = `${route.from}→${route.to}`;
      stats.routesDemand[key] = (stats.routesDemand[key] || 0) + sold;
    }

    return res.json(stats);
  } catch (err) {
    next(err);
  }
}

// Funzione che restiuisce i dettagli della compagnia autenticata

export async function getAirline (
  req: Payload,
  res: Response,
  next: NextFunction
) {
  try {
    const airlineId = req.user.airlineId;
  
    if (!airlineId) throw new BadRequestError('Airline ID mancante nel token');

    const Airline = getAirlineModel();
    const airline = await Airline.findById(airlineId);

    if (!airline) throw new NotFoundError('Compagnia aerea non trovata');

    res.json(airline);
  } catch (err) {
    next(err);
  }
}


// Ottiene le rotte della compagnia aerea autenticata

export async function getRoutes(
  req: Payload,
  res: Response,
  next: NextFunction
) {
  try {
    const airlineId = req.user.airlineId;

    if (!airlineId) throw new BadRequestError('Airline ID non presente nel token.');

    const Route = getRouteModel();
    const routes = await Route.find({ airlineId });

    return res.json(routes);
  } catch (err) {
    next(err);
  }
}

// Ottiene gli aerei della compagnia aerea autenticata

export async function getAircrafts(
  req: Payload,
  res: Response,
  next: NextFunction
) {
 try {
    const airlineId = req.user.airlineId;
    
    if (!airlineId) throw new BadRequestError('Airline ID mancante nel token');

    const Aircraft = getAircraftModel();
    const aircrafts = await Aircraft.find({ airlineId });

    res.json(aircrafts);
  } catch (err) {
    next(err);
  }
}
