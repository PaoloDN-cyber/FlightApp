import { Component, OnInit } from '@angular/core';
import { AuthService }       from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';

  constructor(
    private auth:   AuthService,
    private router: Router,
    private route:  ActivatedRoute,
    private notification: ToastService
  ) {}

  ngOnInit() {}

login() {
  this.auth.login({ email: this.email, password: this.password })
    .subscribe({
      next: () => {
        const user = this.auth.getCurrentUser();
       
        if (user.role === 'airline') { 
          if (user.status === 'definitive') this.router.navigate(['/airline/dashboard']);
          else  this.router.navigate(['../change-password'],{ relativeTo: this.route });
        } else if (user.role === 'admin') this.router.navigate(['/admin/dashboard']);

        else if (user.role === 'passenger') {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl) this.router.navigateByUrl(returnUrl);
          else this.router.navigate(['/search-flights']);
      }
    },
      error: err => {
        if (err.status === 401) {
          this.notification.show('Login fallito', 'Email o password non validi');
        } else if (err.status === 404) {
          this.notification.show('Login fallito', 'Email non registrata');
        } else {
          this.notification.show('Errore', 'Si è verificato un errore');
        }
      }
    });
  }
}
