import { Component, OnInit } from '@angular/core';
import { AirlineService } from '../services/airline.service';
import { ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-airline-stats',
  templateUrl: './airline-stats.component.html',
  styleUrls: ['./airline-stats.component.css']
})
export class AirlineStatsComponent implements OnInit {
  totalPassengers: number = 0;
  totalRevenue: number = 0;
  routesDemand: { [route: string]: number } = {};
  loading = true;

  constructor(
    private airlineService: AirlineService,
    private notify: ToastService
  ) {}

  ngOnInit(): void {
    this.airlineService.getStats().subscribe({
      next: (data: { totalPassengers: number; totalRevenue: number; routesDemand: { [route: string]: number; }; }) => {
        this.totalPassengers = data.totalPassengers;
        this.totalRevenue = data.totalRevenue;
        this.routesDemand = data.routesDemand;
        this.loading = false;
      },
      error: () => {
        this.notify.show('Errore','Errore nel caricamento delle statistiche.');
        this.loading = false;
      }
    });
  }

  get sortedRoutes(): [string, number][] {
    return Object.entries(this.routesDemand).sort((a, b) => b[1] - a[1]);
  }
}
