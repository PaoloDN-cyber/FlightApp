import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AirlineService } from '../services/airline.service';
import { ToastService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment';

interface Aircraft {
  code:  string;
  model: string;
  seats: number;
}

@Component({
  selector: 'app-create-aircraft',
  templateUrl: './create-aircraft.component.html',
  styleUrls: ['./create-aircraft.component.css']
})
export class CreateAircraftComponent implements OnInit {
  aircrafts: Aircraft[] = [];

  // proprietà per ngModel
  model!: string;
  seats!: number;

  constructor(
    private http: HttpClient,
    private airlineService: AirlineService,
    private notify: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http
      .get<Aircraft[]>(`${environment.apiUrl}/assets/aircrafts.json`)
      .subscribe({
        next: list => (this.aircrafts = list),
        error: () => this.notify.show('Errore','Impossibile caricare la lista aerei.')
      });
  }

  onSubmit(): void {
    if (!this.model || !this.seats || this.seats < 1) {
      this.notify.show('Errore','Seleziona modello e numero di posti validi.');
      return;
    }

    this.airlineService
      .createAircraft({ pattern: this.model.trim(), totalSeats: this.seats })
      .subscribe({
        next: () => {
          this.notify.show('Creazione','Aereo creato con successo!');
          this.router.navigate(['/airline/dashboard']);
        },
        error: () => {
          this.notify.show('Errore','Errore durante la creazione dell’aereo.');
        }
      });
  }
}
