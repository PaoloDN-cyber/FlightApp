import { Component, OnInit} from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/notification.service';



@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router,   private notify: ToastService,) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
    this.notify.show('Errore','Accesso negato.');
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    return;
  }
  }
}

