import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminService, UserAirlineCombined } from '../services/admin.service';
import { ToastService } from '../../shared/services/notification.service';
import { AdminUserActionsService } from '../services/admin-user-actions.service';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.css']
})
export class AdminUserDetailComponent implements OnInit {
  userDetail: UserAirlineCombined = { email: '', name: '', role: '', description: '', status: '', createdAt: ''};
 
  searchEmail = '';
  searching = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notification: ToastService,
    private userActions: AdminUserActionsService
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.paramMap.get('email');
    if (email) {
      this.adminService.getDetail(email).subscribe({
        next: (user: UserAirlineCombined) => this.userDetail = user,
        error: (err: { message: string; }) => this.notification.show('Errore', 'Utente non trovato' + err.message)
      });
    }
  }
  
  onSearch(): void {
    if (!this.searchEmail) return;
    this.searching = true;
    this.adminService.getDetail(this.searchEmail).subscribe({
      next: (user: UserAirlineCombined) => {
        this.userDetail = user;
        this.searching = false;
      },
      error: (err: { message: string }) => {
        this.notification.show('Errore', 'Errore nel recupero utente: ' + err.message);
        this.searching = false;
      }
    });
  }

 approve(email: string): void {
  if (!this.userDetail) return;
  this.userActions.approve(email, () => {
    this.userDetail.status = 'approved';
  });
}

  sendReminder(email: string): void {
  if (!this.userDetail) return;
  this.userActions.sendReminder(email);
}

 rejectAirline(email: string): void {
  if (!this.userDetail) return;
  this.userActions.reject(email, () => {
    this.userDetail.status = 'rejected';
  });
}

delete(email: string): void {
  if (!this.userDetail || this.userDetail.role === 'admin') return;

  const confirmed = confirm(`Vuoi veramente cancellare questa compagnia (${email})?`);
  if (!confirmed) return;

  this.adminService.deleteUser(this.userDetail.email).subscribe({
    next: () => {
      this.notification.show('Utente cancellato con successo.', 'Verrai reindirizzato alla dashboard');
      this.router.navigate(['/admin/dashboard']);
    },
    error: (err: { error: { message: string }; message: any }) =>
      this.notification.show('Errore cancellazione', err.error?.message || err.message)
  });
}
  
  isAirline(): boolean {
    return this.userDetail.role === 'airline';
  }

  isPassenger(): boolean {
    return this.userDetail.role === 'passenger';
  }

  isAdmin(): boolean {
    return this.userDetail.role === 'admin';
  }
}

