import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { TicketService } from '../services/ticket.service';
import { SocketService } from '../../shared/services/socket.service';
import { ToastService } from '../../shared/services/notification.service';

interface Seat {
  id: string;
  label: string;
  reserved: boolean;
}

@Component({
  selector: 'app-ticket-booking',
  templateUrl: './ticket-booking.component.html',
  styleUrls: ['./ticket-booking.component.css']
})
export class TicketBookingComponent implements OnInit, OnDestroy {
  flightIds: string[] = [];
  classTypes: string[] = [];
  currentIndex = 0;

  flight: any;
  seats: Seat[] = [];
  selectedSeat: string | null = null;

  extras = { baggage: false, legroom: false };

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private svc: TicketService,
    private socket: SocketService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap;
    this.flightIds = (qp.get('ids') || '').split(',');
    this.classTypes = (qp.get('class') || '').split(',');

    this.loadCurrentFlight();
  }

  private loadCurrentFlight() {
    const fid = this.flightIds[this.currentIndex];
    const classType = this.classTypes[this.currentIndex];

    this.subs.add(forkJoin({
      f: this.svc.getFlightById(fid),
      map: this.svc.checkSeatAvailability(fid)
    }).subscribe({
      next: ({ f, map }) => {
        this.flight = f;
        const total = f.availableSeats;

        let range: [number, number];
        if (classType === 'business') range = [1, 15];
        else if (classType === 'first') range = [16, 30];
        else range = [31, total];

        this.seats = [];
        for (let i = range[0]; i <= range[1] && i <= total; i++) {
          const idx = i - 1;
          this.seats.push({
            id: idx.toString(),
            label: i.toString(),
            reserved: map[idx] || false
          });
        }

        this.selectedSeat = null;
        this.extras = { baggage: false, legroom: false };

        this.socket.connect(localStorage.getItem('token') || undefined);
        this.socket.joinFlightRoom(fid, classType);
        this.listenSocket(fid);
      },
      error: () => this.toast.show('Errore', 'Impossibile caricare volo')
    }));
  }

private listenSocket(fid: string) {
  this.socket.on('seatsConfirmed', (evt: { seats: string[] }) => {
    evt.seats.forEach(id => this.markReserved(id, true));
  });

  this.socket.on('seatSelected', ({ seatId }) => {
    this.markReserved(seatId, true);
  });

  this.socket.on('seatDeselected', ({ seatId }) => {
    this.markReserved(seatId, false);
  });
}

toggleSeat(s: Seat) {
  if (s.reserved) {
    this.toast.show('Attenzione', 'Posto occupato');
    return;
  }

  const fid = this.flightIds[this.currentIndex];
  const classType = this.classTypes[this.currentIndex];

  if (this.selectedSeat === s.id) {
    this.selectedSeat = null;
    this.socket.deselectSeat(fid, classType, s.id);
  } else {
    if (this.selectedSeat) {
      this.socket.deselectSeat(fid, classType, this.selectedSeat);
    }
    this.selectedSeat = s.id;
    this.socket.selectSeat(fid, classType, s.id);
  }
}


  confirm() {
    if (!this.selectedSeat) {
      this.toast.show('Attenzione', 'Seleziona un posto');
      return;
    }

    const fid = this.flightIds[this.currentIndex];
    const classType = this.classTypes[this.currentIndex];
    const seat = this.selectedSeat;

    this.subs.add(
      this.svc.purchaseTickets([fid], classType, [seat], this.extras)
        .subscribe({
          next: () => {
            this.socket.confirmBooking(fid, classType, [seat]);
            this.socket.leaveFlightRoom(fid, classType);

            this.currentIndex++;
            if (this.currentIndex >= this.flightIds.length) {
              this.router.navigate(['/tickets/my-bookings']);
            } else {
              this.loadCurrentFlight();
            }
          },
          error: () => this.toast.show('Errore', 'Prenotazione fallita')
        })
    );
  }

  private markReserved(id: string, reserved: boolean) {
    const seat = this.seats.find(s => s.id === id);
    if (seat) seat.reserved = reserved;
  }

  ngOnDestroy() {
    const fid = this.flight?._id;
    const classType = this.classTypes[this.currentIndex];
    if (fid && classType) this.socket.leaveFlightRoom(fid, classType);
    this.socket.disconnect();
    this.subs.unsubscribe();
  }
}
