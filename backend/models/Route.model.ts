import mongoose from 'mongoose';

// Tipo dei dati in ingresso
export interface RouteInput {
  from: string;
  to: string;
  airlineId?: mongoose.Types.ObjectId;
}

// Tipo del documento Mongoose
export interface Route extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId,
  from: string;
  to: string;
  airlineId: mongoose.Schema.Types.ObjectId;
}

// Schema Mongoose
const routeSchema = new mongoose.Schema<Route>({
  from: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  airlineId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Airline',
    required: true,
  },
});

routeSchema.pre('validate', function (next) {
  if (this.from === this.to) {
    return next(new Error('La partenza e la destinazione devono essere diverse.'));
  }
  next();
});

routeSchema.index({ from: 1, to: 1, airlineId: 1 }, { unique: true });

export function getSchema() { return routeSchema; }

// Singleton del modello
let routeModel: mongoose.Model<Route>;

export function getModel(): mongoose.Model<Route> {
  if (!routeModel) {
    routeModel = mongoose.model<Route>('Route', getSchema());
  }
  return routeModel;
}

// Funzione per creare una nuova rotta
export function newRoute(data: RouteInput): Route {
  let _routemodel = getModel();
  let route = new _routemodel( data);
  return route;
}