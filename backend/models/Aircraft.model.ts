import mongoose from 'mongoose';

// Tipo dei dati di input
export interface AircraftInput {
  pattern: string;
  totalSeats: number;
  airlineId?: mongoose.Types.ObjectId;
}

// Documento Mongoose completo
export interface Aircraft extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId,
  pattern: string;
  totalSeats: number;
  airlineId: mongoose.Schema.Types.ObjectId;
}

// Schema
const aircraftSchema = new mongoose.Schema<Aircraft>({
  pattern: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  airlineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Airline',
    required: true,
  },
});

export function getSchema() { return aircraftSchema; }

// Singleton del modello
let aircraftModel: mongoose.Model<Aircraft>;

export function getModel(): mongoose.Model<Aircraft> {
  if (!aircraftModel) {
    aircraftModel = mongoose.model<Aircraft>('Aircraft', getSchema() );
  }
  return aircraftModel;
}

// Funzione factory
export function newAircraft(data: AircraftInput): Aircraft {
  let _aircraftmodel = getModel();
  let aircraft = new _aircraftmodel( data);
  return aircraft;
}
