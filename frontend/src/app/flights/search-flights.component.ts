import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SearchFlightsService } from './search-flights.service';
import { ToastService } from '../shared/services/notification.service';

interface Airport {
  code: string;
  city: string;
}

interface Itinerary {
  flights: any[];
  flightIds: string[];
  fromToLabel: string;
}

@Component({
  selector: 'app-search-flights',
  templateUrl: './search-flights.component.html',
  styleUrls: ['./search-flights.component.css']
})
export class SearchFlightsComponent implements OnInit {
  airports: Airport[] = [];

  from = '';
  to = '';
  date = '';
  sortBy: 'price' | 'duration' | 'stops' = 'price';

  results: Itinerary[] = [];
  classTypes: string[][] = []; // classe per ogni volo di ogni itinerario
  loading = false;
  error = '';

  constructor(
    private svc: SearchFlightsService,
    private router: Router,
    private notify: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.http.get<Airport[]>(`${environment.apiUrl}/assets/airports.json`)
      .subscribe(data => this.airports = data);
  }

  search() {
    if (!this.from || !this.to || !this.date) {
      this.error = 'Compila tutti i campi';
      return;
    }

    this.loading = true;
    this.error = '';
    this.results = [];
    this.classTypes = [];

    this.svc.searchFlights(this.from, this.to, this.date, this.sortBy)
      .subscribe({
        next: (raw: any[]) => {
          this.loading = false;

          if (!raw.length) {
            this.notify.show('Nessun volo trovato', 'Riprova con altri parametri');
            return;
          }

          this.results = raw.map(legs => ({
            flights: legs,
            flightIds: legs.map((f: any) => f._id),
            fromToLabel: legs.map((f: any) => `${f.route.from}→${f.route.to}`).join(', ')
          }));

          this.classTypes = raw.map(legs => legs.map(() => 'economy')); // default per ogni volo
        },
        error: () => {
          this.loading = false;
          this.error = 'Errore durante la ricerca';
        }
      });
  }

  goToBooking(itinerary: Itinerary, index: number) {
    const flightIds = itinerary.flightIds;
    const selectedClasses = this.classTypes[index];

    this.router.navigate(['/tickets/book', flightIds[0]], {
      queryParams: {
        ids: flightIds.join(','),
        class: selectedClasses.join(',')
      }
    });
  }
}
