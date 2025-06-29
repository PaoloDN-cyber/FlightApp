import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  oldPassword: string = '';
  newPassword: string = '';
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: ToastService
  ) {}

  onSubmit(): void {
    this.submitted = true;

    if (!this.oldPassword || !this.newPassword || this.newPassword.length < 6) {
      return;
    }

    this.authService.changePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    })
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.notification.show('OK', 'Password cambiata con successo');
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        if (err.status === 401) {
          this.notification.show('Errore', 'Password corrente non corretta');
          this.oldPassword = '';
          this.submitted = false;
        } else {
          this.notification.show('Errore',
            err.error?.message || 'Errore durante il cambio password'
          );
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
