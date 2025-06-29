import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketClass, Extra } from '../../models/ticket.model';
import { Flight } from '../../models/flight.model';


import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private Url =  environment.apiUrl;
  private ticketUrl = `${this.Url}/tickets`;
  private flightsUrl = `${this.Url}/flights`;

  constructor(private http: HttpClient) {}

  /** 1) Dati volo */
  getFlightById(flightId: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.flightsUrl}/${flightId}`);
  }

  /** 2) Mappa posti (true = occupato) */
  checkSeatAvailability(flightId: string): Observable<boolean[]> {
    return this.http.get<boolean[]>(`${this.ticketUrl}/seat-map/${flightId}`);
  }

  /** 3) Prenota singolo posto */
  bookSingleSeat(flightId: string, seat: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.ticketUrl}/book/${flightId}`, { seat });
  }

  /** 4) Prenotazione multipla */
  purchaseTickets(
    flights: string[],
    classType: TicketClass,
    seatSelections: string[],
    extras: Extra
  ): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(`${this.ticketUrl}/purchase`, {
      flights,
      classType,
      seatSelections,
      extras,
    });
  }

  /** 5) Lista prenotazioni utente */
  listMyBookings(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.ticketUrl}/myBookings`);
  }

  /** 6) Email conferma */
  sendConfirmationEmail(tickets: Ticket[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.ticketUrl}/sendConfirmation`,
      { tickets }
    );
  }
}
