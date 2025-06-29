import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketBookingComponent } from './ticket-booking/ticket-booking.component';
import { TicketRoutingModule } from './ticket-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyBookingsComponent }    from './my-bookings/my-bookings.component';

@NgModule({
  declarations: [TicketBookingComponent,  MyBookingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    TicketRoutingModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class TicketModule {}
