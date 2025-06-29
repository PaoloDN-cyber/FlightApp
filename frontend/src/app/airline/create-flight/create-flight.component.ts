import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AirlineService } from '../services/airline.service';
import { AuthService }    from '../../auth/services/auth.service';
import { ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-create-flight',
  templateUrl: './create-flight.component.html',
  styleUrls: ['./create-flight.component.css']
})
export class CreateFlightComponent implements OnInit {
  routes: any[] = [];
  aircrafts: any[] = [];

  routeId!: string;
  departureTime!: string;
  arrivalTime!: string;
  aircraftId!: string;
  availableSeats!: number;
  economyPrice!: number;
  businessPrice!: number;
  firstPrice!: number;

  private airlineId!: string;

  constructor(
    private auth: AuthService,
    private airlineService: AirlineService,
    private notify: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'airline' || !user.airlineId) {
      this.notify.show('Errore','Utente non autorizzato.');
      return;
    }
    this.airlineId = user.airlineId;

    this.airlineService.getMyAirline().subscribe({
      next: () => this.loadResources(),
      error: () => this.notify.show('Errore','Errore recupero compagnia.')
    });
  }

  private loadResources(): void {
    this.airlineService.getRoutesByAirline().subscribe({
      next: list => (this.routes = list),
      error: () => this.notify.show('Errore','Errore caricamento rotte.')
    });

    this.airlineService.getAircraftsByAirline().subscribe({
      next: list => (this.aircrafts = list),
      error: () => this.notify.show('Errore','Errore caricamento aerei.')
    });
  }

  getMaxSeats(): number {
    const selected = this.aircrafts.find(a => a._id === this.aircraftId);
    return selected ? selected.totalSeats : 0;
  }

  createFlight(): void {
    if (
      !this.routeId ||
      !this.departureTime ||
      !this.arrivalTime ||
      !this.aircraftId ||
      !this.availableSeats ||
      this.availableSeats < 1 ||
      this.economyPrice == null ||
      this.businessPrice == null ||
      this.firstPrice == null
    ) {
      this.notify.show('Errore','Compila tutti i campi obbligatori.');
      return;
    }

    const selectedAircraft = this.aircrafts.find(a => a._id === this.aircraftId);
    if (selectedAircraft && this.availableSeats > selectedAircraft.totalSeats) {
      this.notify.show('Errore',
        `Posti richiesti (${this.availableSeats}) superiori alla capienza dell’aereo (${selectedAircraft.totalSeats}).`
      );
      return;
    }

    const payload = {
      route: this.routeId,
      departureTime: this.departureTime,
      arrivalTime: this.arrivalTime,
      aircraft: this.aircraftId,
      availableSeats: this.availableSeats,
      price: {
        economy: this.economyPrice,
        business: this.businessPrice,
        first: this.firstPrice
      },
      airlineId: this.airlineId
    };

    this.airlineService.createFlight(payload).subscribe({
      next: () => {
        this.notify.show('Creazione','Volo creato con successo!');
        this.router.navigate(['/airline/dashboard']);
      },
      error: () => this.notify.show('Errore','Errore creazione volo.')
    });
  }
}
