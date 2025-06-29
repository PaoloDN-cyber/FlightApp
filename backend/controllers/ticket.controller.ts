import * as ticket from '../models/Ticket.model.js';
import * as flight from '../models/Flight.model.js';
import { sendMail } from '../utils/mailer.js';
import { Request, Response, NextFunction } from 'express';


/**
 * 1) Mostra posti occupati di un volo
 */
export async function checkSeatAvailability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { flightId } = req.params;
    const bookings = await ticket.getModel().find({ flight: flightId });
    const totalSeats = 100;
    const seatMap = Array(totalSeats).fill(false);

    bookings.forEach((b) => {
      const idx = parseInt(b.seat, 10);
      if (!isNaN(idx) && idx >= 0 && idx < totalSeats) {
        seatMap[idx] = true;
      }
    });

    res.status(200).json(seatMap);
  } catch (err) {
    console.error('Errore nel recupero seat map:', err);
    next(err);
  }
}

/**
 * 2) Funzione condivisa: crea e salva un singolo ticket
 */
async function createTicket({
  userId,
  flightId,
  seat,
  classType,
  extras = { baggage: false, legroom: false },
  io,
}: {
  userId: string;
  flightId: string;
  seat: string;
  classType: 'economy' | 'business' | 'first';
  extras?: { baggage?: boolean; legroom?: boolean };
  io: any;
}) {
  // carica volo e verifica seats
  const f = await flight.getModel().findById(flightId);
  if (!f || f.availableSeats <= 0) {
    throw { status: 400, message: 'Flight not available' };
  }

  // verifica posto non già prenotato
  const existing = await ticket
    .getModel()
    .findOne({ flight: flightId, seat });
  if (existing) {
    throw { status: 409, message: `Seat ${seat} is already taken.` };
  }

  // calcola prezzo con extras
  const price =
    (f.price[classType] ?? f.price.economy) +
    (extras.baggage ? 30 : 0) +
    (extras.legroom ? 20 : 0);

  // crea e salva ticket (cast a any per flight/user)
  const t = ticket.newTicket({
    flight: flightId as any,
    user: userId as any,
    seat,
    extras,
    class: classType,
    price,
  });
  await t.save();

  // decrementa availableSeats
  await flight.getModel().updateOne(
    { _id: flightId },
    { $inc: { availableSeats: -1 } }
  );

  // notifica via socket
  io.to(`${flightId}:${classType}`).emit('seatsConfirmed', {
  flightId,
  classType,
  seats: [seat],
  userId: userId
  });

  return t;
}

/**
 * 3) Prenota singolo posto in un volo
 */
export async function bookSingleSeat(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { seat } = req.body;
  const classType = (req.query.class as string) || 'economy';
  const userId = (req as any).user?.id as string;
  const flightId = req.params.flightId;
  const io = req.app.get('io');

   
  try {
    const t = await createTicket({
      userId,
      flightId,
      seat,
      classType: classType as 'economy' | 'business' | 'first',
      extras: {},
      io,
    });
    res.status(201).json(t);
  } catch (err: any) {
    console.error('Errore prenotazione singolo posto:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Errore durante la prenotazione' });
  }
}

/**
 * 4) Prenota multipli voli (scalo)
 */
export async function purchaseTickets(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    flights,         // string[]
    classType,       // 'economy'|'business'|'first'
    seatSelections,  // string[]
    extras           // { baggage?: boolean; legroom?: boolean }
  } = req.body as {
    flights: string[];
    classType: 'economy'|'business'|'first';
    seatSelections: string[];
    extras: { baggage?: boolean; legroom?: boolean };
  };
  const userId = (req as any).user?.id as string;
  const io     = req.app.get('io');
  const tickets: any[] = [];

  try {
    if (flights.length === 1) {
      // 🔹 Un solo flightId ma molte seats → ciclo su tutte le seats
      const flightId = flights[0];
      for (const seat of seatSelections) {
        const t = await createTicket({
          userId,
          flightId,
          seat,
          classType,
          extras,
          io
        });
        tickets.push(t);
      }
    } else {
      // 🔹 Scalo: arrays paralleli flights[i] ↔ seatSelections[i]
      for (let i = 0; i < flights.length; i++) {
        const flightId = flights[i];
        const seat     = seatSelections[i];
        const t = await createTicket({
          userId,
          flightId,
          seat,
          classType,
          extras,
          io
        });
        tickets.push(t);
      }
    }

    return res.status(201).json(tickets);
  } catch (err: any) {
    console.error('Errore prenotazioni multiple:', err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || 'Errore durante la prenotazione' });
  }
}
/**
 * 5) Lista prenotazioni dell’utente loggato
 */
export async function listMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
   
    const userId = (req as any).user?.id as string;

   
    const all = await ticket
      .getModel()
      .find({ user: userId })
       .populate({
         path: 'flight',
         select: 'route departureTime arrivalTime price',
         populate: [{ path: 'route', select: 'from to' }]
       })
       .lean();
   
    // ② poi filtra in JS sui voli futuri
    const now = new Date();
    const bookings = all.filter(b => {
  const dep = new Date((b.flight as any).departureTime);
  return dep >= now;
});
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Errore recupero prenotazioni:', err);
    next(err);
  }
}

/**
 * 6) Invia conferma via email
 */
export async function sendConfirmationEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userEmail = (req as any).user?.email as string;
  const tickets = req.body.tickets as any[];
  try {
    
    const lines = tickets.map(t => {
      const fromCode = t.flight.route.from.substring(0, 2).toUpperCase();
      const toCode   = t.flight.route.to.substring(0, 2).toUpperCase();
      const depDate = new Date(t.flight.departureTime);
      const hh = String(depDate.getUTCHours()).padStart(2, '0');
      const mm = String(depDate.getUTCMinutes()).padStart(2, '0');
      const timeCode = hh + mm;

      const flightCode = `${fromCode}${toCode}${timeCode}`;
      const seatNumber = Number(t.seat) + 1;

      return `- Volo: ${flightCode}, Posto: ${seatNumber}, Da ${t.flight.route.from}, A ${t.flight.route.to}`;
    });

    const text =
      `Hai prenotato ${tickets.length} biglietti\n` +
      lines.join('\n');

    await sendMail({
      to: userEmail,
      subject: 'Conferma Prenotazione',
      text,
    });

    res.status(200).json({ message: 'Email inviata.' });
  } catch (err) {
    console.error('Errore invio email:', err);
    next(err);
  }
}