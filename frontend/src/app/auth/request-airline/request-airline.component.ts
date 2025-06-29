import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/notification.service';
import { Router } from '@angular/router';  // Importa Router!

@Component({
  selector: 'app-request-airline',
  templateUrl: './request-airline.component.html',
  styleUrls: ['./request-airline.component.css']
})
export class RequestAirlineComponent {
  name = '';
  email = '';
  description = '';

  constructor(
    private auth: AuthService,
    private notification: ToastService,
    private router: Router,
  ) {}

  submit(): void {
    this.auth.registerAirline({
      name: this.name,
      email: this.email,
      description: this.description
    }).subscribe({
      next: () => {
       this.notification.show('Richiesta di iscrizione inviata con successo!', ' Attendi email per credenziali');  
       this.router.navigate(['/login']); 
        },
      error: err => {
      if (err.status === 409) {
        this.notification.show(
          'Errore',
          'Questa email è già stata richiesta da un’altra compagnia'
        );
      } else {
        const msg = err.error?.message || 'Errore durante l\'invio della richiesta';
        this.notification.show('Errore nella richiesta', msg);
      }
    }
  });
  }
}
