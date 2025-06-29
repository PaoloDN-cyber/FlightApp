import mongoose from 'mongoose';

export interface Flight extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId,
  route: mongoose.Types.ObjectId;
  aircraft: mongoose.Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  price: {
    economy: number;
    business?: number;
    first?: number;
  };
  availableSeats: number;
}

export interface FlightInput {
  route: mongoose.Types.ObjectId;
  aircraft: mongoose.Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  price: {
    economy: number;
    business?: number;
    first?: number;
  };
  availableSeats: number;
}

const flightSchema = new mongoose.Schema<Flight>({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  aircraft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aircraft',
    required: true,
  },
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  price: {
    economy: {
      type: Number,
      required: true,
      min: 0,
    },
    business: {
      type: Number,
      min: 0,
    },
    first:{
      type: Number,
      min: 0,
    },
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Impone che non ci siano due voli identici su stessa rotta, aereo e orario
flightSchema.index(
  { route: 1, aircraft: 1, departureTime: 1 },
  { unique: true }
);

flightSchema.pre('validate', function (next) {
  if (this.departureTime >= this.arrivalTime) {
    return next(new Error('departureTime deve essere prima di arrivalTime.'));
  }
  next();
});

export function getSchema() {
  return flightSchema;
}

let flightModel: mongoose.Model<Flight>;

export function getModel(): mongoose.Model<Flight> {
  if (!flightModel) {
    flightModel = mongoose.model<Flight>('Flight', getSchema());
  }
  return flightModel;
}

export function newFlight(data: FlightInput): Flight {
    let _flightmodel = getModel();
    let flight = new _flightmodel( data);
    return flight;
}
