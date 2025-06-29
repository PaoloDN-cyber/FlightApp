export interface Flight {
  _id: string;             // ID come stringa (ObjectId serializzato)
  route: string;           // ID rotta come stringa
  aircraft: string;        // ID aereo come stringa
  departureTime: string;   // Data/ora in ISO string (Date in backend)
  arrivalTime: string;     // idem
  price: {
    economy: number;
    business?: number;
    first?: number;
  };
  availableSeats: number;
}