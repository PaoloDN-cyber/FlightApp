import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketBookingComponent } from './ticket-booking/ticket-booking.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';


const routes: Routes = [
  {
    path: 'book/:flightId',
    component: TicketBookingComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'passenger' }
  },
  {
    path: 'my-bookings',
    component: MyBookingsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'passenger' }
  },
  // se vuoi un redirect di default da /tickets → /tickets/my-bookings
  { path: '', redirectTo: 'my-bookings', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule {}
