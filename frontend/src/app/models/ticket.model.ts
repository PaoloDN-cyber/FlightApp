export type TicketClass = 'economy' | 'business' | 'first' | (string & {});

export interface Extra {
  baggage?: boolean;
  legroom?: boolean;
}

export interface Ticket {
  _id: string;
  flight: string;
  user: string;
  seat: string;
  extras?: Extra;
  price: number;
  class: TicketClass;   
  createdAt: string;
}
