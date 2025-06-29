import { Injectable } from '@angular/core';
import { AdminService } from './admin.service';
import { ToastService } from '../../shared/services/notification.service';

@Injectable({ providedIn: 'root' })
export class AdminUserActionsService {

  constructor(
    private admin: AdminService,
    private toast: ToastService
  ) {}

  approve(email: string, onSuccess?: () => void): void {
    this.admin.approveAirline(email).subscribe({
      next: res => {
        this.toast.show('Approvazione riuscita', res.message || 'Compagnia approvata');
        onSuccess?.();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Errore sconosciuto';
        this.toast.show('Errore approvazione', msg);
      }
    });
  }

  reject(email: string, onSuccess?: () => void): void {
    this.admin.rejectAirline(email).subscribe({
      next: () => {
        this.toast.show('Compagnia rifiutata', 'Lo stato è stato aggiornato correttamente.');
        onSuccess?.();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Errore sconosciuto';
        this.toast.show('Errore rifiuto', msg);
      }
    });
  }

  sendReminder(email: string): void {
    this.admin.sendPasswordChangeReminder(email).subscribe({
      next: res => {
        this.toast.show('Promemoria inviato', res.message);
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Errore sconosciuto';
        this.toast.show('Errore invio promemoria', msg);
      }
    });
  }
}
