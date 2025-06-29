import { Component } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: User | null = null;

  constructor(public authService: AuthService, private router: Router) {
    this.user = this.authService.getCurrentUser(); // recupera utente loggato se c'è
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn(); 
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  isAirline(): boolean {
    return this.user?.role === 'airline';
  }

  isPassenger(): boolean {
    return this.user?.role === 'passenger';
  }
}
