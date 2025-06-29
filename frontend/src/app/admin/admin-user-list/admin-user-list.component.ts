import { Component, OnInit } from '@angular/core';
import { AdminService, UserAirlineCombined } from '../services/admin.service';
import { ToastService } from '../../shared/services/notification.service';
import { AuthService } from '../../auth/services/auth.service';
import { retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminUserActionsService } from '../services/admin-user-actions.service';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.css']
})
export class AdminUserListComponent implements OnInit {

  allUsers:      UserAirlineCombined[] = [];
  filteredUsers: UserAirlineCombined[] = [];

  selectedRole = 'all';
  currentPage  = 1;
  pageSize     = 5;

  loading = false;

  constructor(
    private adminService: AdminService,
    private notification: ToastService,
    private authService: AuthService,
    private router: Router,
    private userActions: AdminUserActionsService
  ) {}

  ngOnInit(): void
{
  if (this.authService.isLoggedIn()) {
    /* aspetta il segnale che il token è pronto */
    this.authService.waitForToken().subscribe(() => this.loadUsers());
  } else {
    /* utente non loggato → ridireziona o resta in pagina di login */
    this.router.navigate(['/auth/login']);
  }
}
  loadUsers(): void {
    this.loading = true;

    this.adminService.getUsers().pipe(
      retry({ delay: 800, count: 2 })        // facoltativo
    ).subscribe({
      next: users => {
        this.allUsers = users;
        this.applyFilter();
        this.loading = false;
      },
      error: err => {
        this.notification.show(
          'Errore caricamento utenti: ', (err.message || err)
        );
        this.loading = false;
      }
    });
  }

  /* ───────── FILTRO ───────── */
  applyFilter(): void {
    this.filteredUsers = this.selectedRole === 'all'
      ? [...this.allUsers]
      : this.allUsers.filter(u => u.role === this.selectedRole);

    this.currentPage = 1;
  }

  /* ───────── AZIONI AIRLINE ───────── */
  approveAirline(email: string): void {
     this.userActions.approve(email, () => this.loadUsers());
  }

  rejectAirline(email: string): void {
    this.userActions.reject(email, () => this.loadUsers());
  }

  sendReminder(email: string): void {
    this.userActions.sendReminder(email);
  }

  /* ───────── PAGINAZIONE ───────── */
  get paginatedUsers(): UserAirlineCombined[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }
  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }
}
