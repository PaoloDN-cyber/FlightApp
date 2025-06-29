 // ==============================

/* global db, ObjectId, crypto */

// ─────────────────────────────────────────────
// 1.  Helpers
// ─────────────────────────────────────────────
function makeUser({
  _id = ObjectId(),
  email,
  name,
  password,
  role = 'passenger',
  airlineId = null
}) {
  const salt   = crypto.randomBytes(16).toString('hex');
  const digest = crypto.createHmac('sha512', salt).update(password).digest('hex');
  const u = { _id, email, name, salt, digest, role };
  if (airlineId) u.airlineId = typeof airlineId === 'string' ? ObjectId(airlineId) : airlineId;
  return u;
}



// ─────────────────────────────────────────────
// 2.  DB & cleanup
// ─────────────────────────────────────────────
const db = db.getSiblingDB('flightapp');
db.users.drop(); db.airlines.drop(); db.aircrafts.drop();
db.routes.drop(); db.flights.drop();  db.tickets.drop();

// ─────────────────────────────────────────────
// 3.  ID pools 
// ─────────────────────────────────────────────
const userIds     = Array.from({ length: 13 }, () => ObjectId());
const airlineIds  = Array.from({ length: 8 }, () => ObjectId());
const aircraftIds = Array.from({ length: 8 }, () => ObjectId());
const routeIds    = Array.from({ length: 8 }, () => ObjectId());
const flightIds   = Array.from({ length: 8 }, () => ObjectId());
const ticketIds   = Array.from({ length: 8 }, () => ObjectId());

// ─────────────────────────────────────────────
// 4.  USERS  (13)
// ─────────────────────────────────────────────
db.users.insertMany([
  makeUser({ _id: userIds[0], email: 'alice@mail.com',  name: 'Alice Rossi',  password: 'pass123'}),
  makeUser({ _id: userIds[1], email: 'bob@mail.com',    name: 'Bob Bianchi', password: 'pass234'  }),
  makeUser({ _id: userIds[2], email: 'carl@mail.com',   name: 'Carl Verdi',  password: 'pass345' }),
  makeUser({ _id: userIds[3], email: 'dora@mail.com',   name: 'Dora Neri',   password: 'pass456' }),

  // manager airline A-D
  makeUser({ _id: userIds[4], email: 'manager@italfly.com', name: 'ItalFly Mgr', role:'airline', password:'italfly123', airlineId: airlineIds[0] }),
  makeUser({ _id: userIds[5], email: 'manager@skyalps.com', name: 'SkyAlps Mgr', role:'airline', password:'skyalps123', airlineId: airlineIds[1] }),
  makeUser({ _id: userIds[6], email: 'manager@eurojet.com',  name: 'EuroJet Mgr', role:'airline', password:'eurojet123', airlineId: airlineIds[2] }),
  makeUser({ _id: userIds[7], email: 'admin@flightapp.com', name: 'Super Admin',  role:'admin', password: 'adminpass' }),
  makeUser({ _id: userIds[8], email: 'manager@mediair.com',  name: 'MediAir Mgr', role:'airline', password:'mediair123', airlineId: airlineIds[3] }),
  makeUser({ _id: userIds[9], email: 'manager@globalwing.com',  name: 'GlobalWing Mgr', role:'airline', password:'globalwing123', airlineId: airlineIds [4] }),
  makeUser({ _id: userIds[10], email: 'manager@sicilyair.com',  name: 'SicilyAir Mgr', role:'airline', password:'sicilyair123', airlineId: airlineIds[5] }),
  makeUser({ _id: userIds[11], email: 'manager@alpair.com',  name: 'AlpAir Mgr', role:'airline', password:'alpair123', airlineId: airlineIds[6] }),
  makeUser({ _id: userIds[12], email: 'manager@nordicway.com',  name: 'NordicWay Mgr', role:'airline', password:'nordicway123', airlineId: airlineIds[7] }),  
]);


// ─────────────────────────────────────────────
// 5.  AIRLINES  (8)
// ─────────────────────────────────────────────
db.airlines.insertMany([
  { _id: airlineIds[0], description:'ItalFly',     status:'definitive', createdAt:new Date() },
  { _id: airlineIds[1], description:'SkyAlps',     status:'approved',   createdAt:new Date() },
  { _id: airlineIds[2], description:'EuroJet',     status:'approved',   createdAt:new Date() },
  { _id: airlineIds[3], description:'MediAir',     status:'pending',    createdAt:new Date() },
  { _id: airlineIds[4], description:'GlobalWing',  status:'definitive', createdAt:new Date() },
  { _id: airlineIds[5], description:'SicilyAir',   status:'approved',   createdAt:new Date() },
  { _id: airlineIds[6], description:'AlpAir',      status:'pending',    createdAt:new Date() },
  { _id: airlineIds[7], description:'NordicWay',   status:'approved',   createdAt:new Date() }
]);

// ─────────────────────────────────────────────
// 6.  AIRCRAFTS  (8)
// ─────────────────────────────────────────────
db.aircrafts.insertMany([
  { _id: aircraftIds[0], pattern:'A320-IT1', totalSeats:150, airlineId:airlineIds[0] },
  { _id: aircraftIds[1], pattern:'B737-SA1', totalSeats:180, airlineId:airlineIds[1] },
  { _id: aircraftIds[2], pattern:'A220-EJ1', totalSeats:125, airlineId:airlineIds[2] },
  { _id: aircraftIds[3], pattern:'B787-GW1', totalSeats:240, airlineId:airlineIds[4] },
  { _id: aircraftIds[4], pattern:'A330-IT2', totalSeats:250, airlineId:airlineIds[0] },
  { _id: aircraftIds[5], pattern:'ATR72-SA2',totalSeats: 70, airlineId:airlineIds[1] },
  { _id: aircraftIds[6], pattern:'E195-MA1', totalSeats:132, airlineId:airlineIds[3] },
  { _id: aircraftIds[7], pattern:'A321-NW1', totalSeats:200, airlineId:airlineIds[7] }
]);

// ─────────────────────────────────────────────
// 7.  ROUTES  (8) – inclusi i segmenti di scalo
// ─────────────────────────────────────────────
db.routes.insertMany([
  { _id: routeIds[0], from:'rom',    to:'mil',    airlineId:airlineIds[0] },
  { _id: routeIds[1], from:'vce', to:'nap',    airlineId:airlineIds[1] },
  { _id: routeIds[2], from:'nap',  to:'vce',   airlineId:airlineIds[1] }, // segmento A
  { _id: routeIds[3], from:'vce', to:'par',    airlineId:airlineIds[2] }, // segmento B
  { _id: routeIds[4], from:'tor',  to:'fra', airlineId:airlineIds[3] },
  { _id: routeIds[5], from:'fra', to:'bos', airlineId:airlineIds[6] },
  { _id: routeIds[6], from:'pal', to:'lhr',    airlineId:airlineIds[4] },
  { _id: routeIds[7], from:'bol', to:'vie',    airlineId:airlineIds[5] },
]);

// ─────────────────────────────────────────────
// 8.  FLIGHTS  (8)
// ─────────────────────────────────────────────

const baseDate = new Date('2025-07-01T00:00:00');  // locale
function atHourLocal(date, hour) {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

db.flights.insertMany([
  { _id: flightIds[0], route:routeIds[0], aircraft:aircraftIds[0], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:60,business:110,first:170 }, availableSeats:150 },
  { _id: flightIds[1], route:routeIds[1], aircraft:aircraftIds[1], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:55,business:105,first:160 }, availableSeats:180 },
  { _id: flightIds[2], route:routeIds[2], aircraft:aircraftIds[5], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:45,business: 95,first:140 }, availableSeats: 70 },
  { _id: flightIds[3], route:routeIds[3], aircraft:aircraftIds[2], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:80,business:140,first:200 }, availableSeats:125 },
  { _id: flightIds[4], route:routeIds[4], aircraft:aircraftIds[6], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:65,business:120,first:180 }, availableSeats:132 },
  { _id: flightIds[5], route:routeIds[5], aircraft:aircraftIds[7], departureTime:atHourLocal(baseDate, 14), arrivalTime:atHourLocal(baseDate, 16), price:{ economy:300,business:550,first:750 }, availableSeats:200 },
  { _id: flightIds[6], route:routeIds[6], aircraft:aircraftIds[3], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:85,business:145,first:200 }, availableSeats:240 },
  { _id: flightIds[7], route:routeIds[7], aircraft:aircraftIds[4], departureTime:atHourLocal(baseDate, 10), arrivalTime:atHourLocal(baseDate, 12), price:{ economy:40,business: 90,first:140 }, availableSeats:250 }
]);

// ─────────────────────────────────────────────
// 9.  TICKETS  (8)  – associati a 6 voli
// ─────────────────────────────────────────────
db.tickets.insertMany([
  { _id:ticketIds[0], flight:flightIds[0], user:userIds[0], seat:'12', extras:{baggage:true},  price: 110, class:'business', createdAt:new Date() },
  { _id:ticketIds[1], flight:flightIds[0], user:userIds[2], seat:'1',  extras:{baggage:true,legroom:true}, price:110, class:'business', createdAt:new Date() },
  { _id:ticketIds[2], flight:flightIds[1], user:userIds[1], seat:'5',  extras:{baggage:true,legroom:true}, price:105, class:'business', createdAt:new Date() },
  { _id:ticketIds[3], flight:flightIds[2], user:userIds[3], seat:'20', extras:{}, price:140,  class:'first', createdAt:new Date() },
  { _id:ticketIds[4], flight:flightIds[3], user:userIds[0], seat:'14', extras:{baggage:true}, price:140,  class:'business', createdAt:new Date() },
  { _id:ticketIds[5], flight:flightIds[4], user:userIds[2], seat:'2',  extras:{baggage:true}, price:120, class:'business', createdAt:new Date() },
  { _id:ticketIds[6], flight:flightIds[6], user:userIds[3], seat:'3',  extras:{baggage:true,legroom:true}, price:145, class:'business', createdAt:new Date() },
  { _id:ticketIds[7], flight:flightIds[7], user:userIds[1], seat:'22', extras:{}, price:140,  class:'first', createdAt:new Date() }
]);

// ─────────────────────────────────────────────
// 10. Aggiorna availableSeats  (coerenza)
// ─────────────────────────────────────────────
function dec(fId, n) { db.flights.updateOne({ _id:fId }, { $inc:{ availableSeats:-n } }); }

dec(flightIds[0], 2); // tickets 0,1
dec(flightIds[1], 1); // ticket 2
dec(flightIds[2], 1); // ticket 3
dec(flightIds[3], 1); // ticket 4
dec(flightIds[4], 1); // ticket 5
dec(flightIds[6], 1); // ticket 6
dec(flightIds[7], 1); // ticket 7
// flightIds[5] rimane pieno (nessun biglietto)
