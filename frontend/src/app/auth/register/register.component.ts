import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';  // Importa Router!
import { ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
   styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';


  constructor(
    private auth: AuthService, 
    private router: Router, 
    private notification: ToastService,
  ) {}

register() {
  this.auth.register({ name: this.name, email: this.email, password: this.password })
    .subscribe({
      next: () => {
        this.notification.show('Registrazione ompletata!', 'Verrai reindirizzato alla homepage.');
        this.router.navigate(['/login']);
      },
       error: err => {
        if (err.status === 409) {
          // email già presente
          this.notification.show('Errore', 'Questa email è già in uso.');
        } else {
          // altri errori di validazione o di rete
          const msg = err.error?.message || 'Errore nella registrazione';
          this.notification.show('Errore in fase di registrazione', msg);
        }
      }
    });
}
}