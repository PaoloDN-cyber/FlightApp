import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable()
export class SearchFlightsService {
  private url = environment.apiUrl;
  private apiUrl =`${this.url}/flights`;

  constructor(private http: HttpClient) {}
  

  searchFlights(from: string, to: string, date: string, sortBy: string): Observable<any[][]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('date', date)        
      .set('sortBy', sortBy);
     return this.http.get<any[][]>(`${this.apiUrl}/search`, { params });
  }
}
