import { Component, OnInit } from '@angular/core';
import { AuthService }       from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // All’avvio della SPA (es. dopo rebuild del container),
    // forza la pulizia del token salvato in localStorage
    this.auth.logout();
  }
    title = 'FlightBookingApp';
}