import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { AirlineService } from '../services/airline.service';
import { ToastService } from '../../shared/services/notification.service';
import { User } from '../../models/user.model';
import { Airline } from '../../models/airline.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-airline-dashboard',
  templateUrl: './airline-dashboard.component.html',
  styleUrls: ['./airline-dashboard.component.css']
})
export class AirlineDashboardComponent implements OnInit {
  user!: User;
  airline!: Airline;

  constructor(
    private authService: AuthService,
    private airlineService: AirlineService,
    private notify: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();

    if (!this.user || this.user.role !== 'airline') {
      this.notify.show('Errore', 'Accesso negato.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.user.airlineId) {
      this.airlineService.getMyAirline().subscribe({
        next: (airline: Airline) => {
          if (airline.status !== 'definitive') {
            this.notify.show('Errore','Accesso riservato alle compagnie attive.');
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else {
            this.airline = airline;
          }
        },
        error: () => {
          this.notify.show('Errore','Errore nel recupero della compagnia.');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
