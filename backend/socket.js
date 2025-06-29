import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

// Mappa dei lock per ogni stanza `flightId:classType`
const flightClassSeatLocks = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET','POST','DELETE','PATCH'],
      credentials: true,
    }
  });

  // JWT middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', socket => {
    console.log('Nuovo client connesso:', socket.id);

    socket.on('joinFlightRoom', ({ flightId, classType }) => {
      if (!socket.user) return socket.emit('error','Not authenticated');
      const room = `${flightId}:${classType}`;
      socket.join(room);
      if (!flightClassSeatLocks.has(room)) {
        flightClassSeatLocks.set(room, new Map());
      }
      console.log(`${socket.id} unito alla stanza ${room}`);
    });

    socket.on('leaveFlightRoom', ({ flightId, classType }) => {
      const room = `${flightId}:${classType}`;
      socket.leave(room);
      releaseAllSeatsForSocket(room, socket.id);
      const map = flightClassSeatLocks.get(room);
      if (map && map.size === 0) flightClassSeatLocks.delete(room);
      console.log(`${socket.id} ha lasciato stanza ${room}`);
    });

    socket.on('selectSeat', ({ flightId, classType, seatId }) => {
      const room = `${flightId}:${classType}`;
      const seatMap = flightClassSeatLocks.get(room);
      if (!seatMap) return;
      if (seatMap.has(seatId)) {
        return socket.emit('seatSelectionError', { seatId, message: 'Posto già selezionato' });
      }
      seatMap.set(seatId, socket.id);
      socket.broadcast.to(room).emit('seatSelected', { seatId });
    });

    socket.on('deselectSeat', ({ flightId, classType, seatId }) => {
      const room = `${flightId}:${classType}`;
      const seatMap = flightClassSeatLocks.get(room);
      if (!seatMap) return;
      if (seatMap.get(seatId) === socket.id) {
        seatMap.delete(seatId);
        socket.broadcast.to(room).emit('seatDeselected', { seatId });
      }
    });

    socket.on('confirmBooking', ({ flightId, classType, seats }) => {
      const room = `${flightId}:${classType}`;
      const seatMap = flightClassSeatLocks.get(room);
      if (!seatMap) return;
      seats.forEach(seatId => {
        if (seatMap.get(seatId) === socket.id) {
          seatMap.delete(seatId);
        }
      });
       io.to(room).emit('seatsConfirmed', { flightId, classType, seats, userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnesso:', socket.id);
      for (const room of flightClassSeatLocks.keys()) {
        releaseAllSeatsForSocket(room, socket.id);
      }
    });
  });
}

function releaseAllSeatsForSocket(room, socketId) {
  const seatMap = flightClassSeatLocks.get(room);
  if (!seatMap) return;
  const toRelease = [];
  seatMap.forEach((locker, seatId) => {
    if (locker === socketId) {
      toRelease.push(seatId);
      seatMap.delete(seatId);
    }
  });
  if (toRelease.length) {
    // mando l’evento a tutti tranne il mittente
    io.to(room).clients((err, clients) => {
      // clients è l’array di tutti i socket.id nella stanza
      clients
        .filter(id => id !== socketId)
        toRelease.forEach(seatId => {
  clients
    .filter(id => id !== socketId)
    .forEach(id => io.to(id).emit('seatDeselected', { seatId }));
    });

    });
  }
}
function getIO() {
  if (!io) throw new Error('Socket.io non inizializzato!');
  return io;
}

export { initSocket, getIO };
