import { Component, OnInit } from '@angular/core';
import { TicketService } from '../services/ticket.service';
import { Router } from '@angular/router';
import { SocketService } from '../../shared/services/socket.service';
import { AuthService }   from '../../auth/services/auth.service';
import { ToastService} from '../../shared/services/notification.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];

  constructor(
    private svc: TicketService,
      private socketService: SocketService,
  private authService: AuthService,
    private router: Router,
    private notification : ToastService
  ) {}

ngOnInit() {
  // 1) Caricamento iniziale delle mie prenotazioni
  this.svc.listMyBookings().subscribe(bs => {
     console.log('→ [Client] Initial bookings from HTTP:', bs.map(b => b._id));
    this.bookings = bs;
  });

  // 2) Aggiornamento real-time: ricarico SOLO se evt.userId è il mio
  this.socketService.on('seatsConfirmed', (evt: any) => {
    if (evt.userId && evt.userId === this.authService.getCurrentUser().id) {
      this.svc.listMyBookings().subscribe(bs => {
        this.bookings = bs;
      });
    }
  });
}


  

  sendConfirmation() {
    this.svc.sendConfirmationEmail(this.bookings).subscribe(() => {
      this.notification.show('Complimenti','Email di conferma inviata');
      this.router.navigate(['/search-flights']);
    });
  }
}
