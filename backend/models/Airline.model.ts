import mongoose from 'mongoose';

export interface Airline extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId,
  description: string,
  status: 'pending' | 'approved' | 'rejected' | 'definitive';
  createdAt: Date, 
}

export interface AirlineInput {
  description: string;
  status?: 'pending' | 'approved' | 'rejected' | 'definitive';
}

const airlineSchema = new mongoose.Schema<Airline>({
  description: {  type: mongoose.Schema.Types.String, default: '', },
  status: { 
    type:  mongoose.Schema.Types.String,
    enum: ['pending', 'approved', 'rejected', 'definitive'], 
    default: 'pending', 
 },
  createdAt: { 
    type: Date, 
    default: Date.now,
 },
});

export function getSchema() { return airlineSchema; }

// Mongoose Model
let airlineModel: mongoose.Model<Airline>;  // Questo non è visibile all'esterno

export function getModel() : mongoose.Model< Airline >  { // Restitusice il modello come singleton
    if( !airlineModel ) {
        airlineModel = mongoose.model('Airline', getSchema() )
    }
    return airlineModel;
}

export function newAirline(data: AirlineInput): Airline {
    let _airlinemodel = getModel();
    let airline = new _airlinemodel( data);

    return airline;
}