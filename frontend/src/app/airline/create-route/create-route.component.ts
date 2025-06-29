import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AirlineService } from '../services/airline.service';
import { ToastService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment';

interface Airport {
  code: string;
  city: string;
}

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html'
})
export class CreateRouteComponent implements OnInit {
  airports: Airport[] = [];

  // proprietà per ngModel
  from!: string;
  to!: string;

  constructor(
    private http: HttpClient,
    private airlineService: AirlineService,
    private notify: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http.get<Airport[]>(`${environment.apiUrl}/assets/airports.json`)
             .subscribe(list => (this.airports = list));
  }

  onSubmit(): void {
    if (!this.from || !this.to) {
      this.notify.show('Errore', 'Compila entrambi i campi.');
      return;
    }

    if (this.from === this.to) {
      this.notify.show('Errore', 'Gli aeroporti devono essere diversi.');
      return;
    }

    const payload = { from: this.from, to: this.to };

    this.airlineService.createRoute(payload).subscribe({
      next: () => {
        this.notify.show('Creazione', 'Rotta creata con successo!');
        this.router.navigate(['/airline/dashboard']);
      },
      error: err => {
        this.notify.show('Errore',
          err.status === 409
            ? 'Questa rotta esiste già.'
            : 'Errore durante la creazione della rotta.'
        );
      }
    });
  }
}
