
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airline } from '../../models/airline.model';
import { Aircraft } from '../../models/aircraft.model';
import { Route } from '../../models/route.model';

import { AuthService } from '../../auth/services/auth.service';  
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AirlineService {
  private Url = environment.apiUrl;
  private apiUrl =`${this.Url}/airline-panel`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Recupera la compagnia autenticata
  getMyAirline(): Observable<Airline> {
    return this.http.get<Airline>(`${this.apiUrl}/me`);
  }

  // Recupera tutte le rotte associate alla compagnia aerea autenticata
  getRoutesByAirline(): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/routes`);
  }

  //  Recupera tutti gli aerei associati alla compagnia aerea autenticata
  getAircraftsByAirline(): Observable<Aircraft[]> {
    return this.http.get<Aircraft[]>(`${this.apiUrl}/aircrafts`);
  }

  // Crea una rotta
  createRoute(data: { from: string; to: string }): Observable<any> {
    const currentAirlineId = this.auth.getCurrentUser()?.airlineId!;
    const payload = { ...data, airlineId: currentAirlineId };
    return this.http.post(`${this.apiUrl}/routes`, payload);
  }

  // Crea un nuovo volo
  createFlight(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/flights`, data);
  }

  // Crea un aereo
  createAircraft(data: { pattern: string; totalSeats: number }): Observable<Aircraft> {
    return this.http.post<Aircraft>(`${this.apiUrl}/aircrafts`, data);
  }

  // Ottiene dati statistici sulla compagnia
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

}
