import { Request, Response, NextFunction } from 'express';
import * as flightModel from '../models/Flight.model.js';
import * as routeModel  from '../models/Route.model.js';
import { AppError }     from '../utils/errors.js';
import * as aircraftModel from '../models/Aircraft.model.js';

// Forza l'inizializzazione del modello "Aircraft" al primo caricamento del file
aircraftModel.getModel();

// Funzione che restiusice i voli per data, partenza e destinazione; 
// possibile 1 scalo con ora di partenza del seccondo volo dopo 2 ore dall'arrivo del primo

export async function searchFlights(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Parametri di query
    const { from, to, sortBy = 'price', date } = req.query as any;
    if (!from || !to) {
      return next(new AppError("Parametri 'from' e 'to' obbligatori.", 400));
    }
    if (!date) {
      return next(new AppError("Parametro 'date' obbligatorio.", 400));
    }

    // 2) Normalizza solo per confronto
    const fromLc = String(from).toLowerCase();
    const toLc   = String(to).toLowerCase();

    // 3) Calcola inizio/fine giornata in ORARIO LOCALE
    const d = new Date(date);            
    const startOfDay = new Date(d);
    startOfDay.setHours(0, 0, 0, 0);      
    const endOfDay = new Date(d);
    endOfDay.setHours(24, 0, 0, 0);       

    // 4) Trova rotte “utile” (diretta o per scalo)
    const matchingRoutes = await routeModel.getModel()
      .find({
        $or: [
          { from: fromLc, to: toLc },  // diretto
          { from: fromLc },            // primo tratto scalo
          { to:   toLc }               // secondo tratto scalo
        ]
      })
      .select('_id from to')
      .lean();

    if (matchingRoutes.length === 0) {
      // nessuna rotta diretta né scalo
      return res.json([]);
    }

    // 5) Prepara mappa e lista id
    const routeMap = new Map<string, { from: string; to: string }>();
    matchingRoutes.forEach(r => {
      routeMap.set(r._id.toString(), {
        from: (r.from as string).toLowerCase(),
        to:   (r.to   as string).toLowerCase()
      });
    });
    const routeIds = matchingRoutes.map(r => r._id);

    // 6) Ricava tutti i voli di queste rotte in quel giorno
    const allFlights = await flightModel.getModel()
      .find({
        route: { $in: routeIds },
        departureTime: { $gte: startOfDay, $lt: endOfDay }
      })
      .populate('route')
      .lean<any[]>();

    // 7a) Voli diretti
    const direct = allFlights
      .filter(f => {
        const rt = f.route as any;
        return rt.from.toLowerCase() === fromLc && rt.to.toLowerCase() === toLc;
      })
      .map(f => [f] as any[]);

      // 7b) Voli con 1 scalo
      const oneStops: any[][] = [];

      // 1) Prima tratta: voli in partenza da “from” ma non diretti a destinazione
      const firstLegs = allFlights.filter(f => {
      const rt = f.route as any;
      return rt.from.toLowerCase() === fromLc && rt.to.toLowerCase()   !== toLc;
      });

      // 2) Per ogni primo volo, cerco i secondi validi
      for (const first of firstLegs) {
        // città di arrivo del primo volo
        const arrCity = (first.route as any).to.toLowerCase();
        // timestamp minimo per la partenza del secondo (+2h)
        const minDep2 = new Date(first.arrivalTime).getTime() + 2 * 3600_000;

        // trovo tutti i voli che partono da arrCity e arrivano a “to”
        const candidates2 = allFlights.filter(f2 => {
        const rt2 = f2.route as any;
        return rt2.from.toLowerCase() === arrCity && rt2.to.toLowerCase()   === toLc
            && new Date(f2.departureTime).getTime() >= minDep2;
      });

      // combino ogni abbinamento valido
      for (const second of candidates2) {
        oneStops.push([first, second]);
      }
    }

    // 8) Unisci risultati
    const results = [...direct, ...oneStops];

    // 9) Helpers per ordinare
    const totalPrice = (legs: any[]) => legs.reduce((sum, f) => sum + (f.price.economy||0), 0);
    const getDuration = (legs: any[]) => {
      const t0 = new Date(legs[0].departureTime).getTime();
      const t1 = new Date(legs[legs.length - 1].arrivalTime).getTime();
      return t1 - t0;
    };
    // 10) Ordina
    results.sort((a, b) => {
      if (sortBy === 'price')    return totalPrice(a) - totalPrice(b);
      if (sortBy === 'duration') return getDuration(a) - getDuration(b);
      return a.length - b.length;
    });

    // 11) Risposta
    return res.json(results);
  } catch (err) {
    return next(err);
  }
}

// Funzione che restituisce un volo particolare

export async function getFlightById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const flight = await flightModel
      .getModel()
      .findById(id)
      .populate('route')
      .populate('aircraft') 
      .lean();

    if (!flight) {
      return next(new AppError('Volo non trovato', 404));
    }

    return res.json(flight);
  } catch (err) {
    console.error('Errore in getFlightById:', err);
    return next(err);
  }
}

