export type AirlineStatus = 'pending' | 'approved' | 'rejected' | 'definitive' | (string & {});

export interface Airline {
  _id: string;
  description: string;
  status: AirlineStatus;
  createdAt: string; 
}