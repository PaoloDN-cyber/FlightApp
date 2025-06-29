import mongoose from 'mongoose';

export interface Extra {
  baggage?: boolean;
  legroom?: boolean;
}

export interface Ticket extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId;
  flight: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  seat: string;
  extras?: Extra;
  price: number;
  class: 'economy' | 'business' | 'first'; 
  createdAt: Date;
}

const extraSchema = new mongoose.Schema<Extra>({
  baggage: { type: Boolean, default: false },
  legroom: { type: Boolean, default: false },
});

const ticketSchema = new mongoose.Schema<Ticket>({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seat: { type: String, required: true },
  extras: { type: extraSchema, required: false },
  price: { type: Number, required: true },
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export function getSchema() { return ticketSchema; }

let ticketModel: mongoose.Model<Ticket>;

export function getModel(): mongoose.Model<Ticket> {
  if (!ticketModel) {
    ticketModel = mongoose.model('Ticket', getSchema());
  }
  return ticketModel;
}

export function newTicket(data: Partial<Ticket>): Ticket {
  const model = getModel();
  return new model(data);
}
