export type UserRole = 'admin' | 'airline' | 'passenger' | (string & {});

export interface User {
  _id: string;
  email: string;
  name: string;
  role?: UserRole;
  airlineId?: string;
}
