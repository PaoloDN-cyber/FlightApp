import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AirlineDashboardComponent } from './airline-dashboard/airline-dashboard.component';
import { CreateRouteComponent } from './create-route/create-route.component';
import { CreateFlightComponent } from './create-flight/create-flight.component';
import { CreateAircraftComponent } from './create-aircraft/create-aircraft.component';
import { AirlineStatsComponent } from './airline-stats/airline-stats.component';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AirlineDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'airline' },
    children: [
      {
        path: 'create-route',
        component: CreateRouteComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'airline' }
      },
      {
        path: 'create-flight',
        component: CreateFlightComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'airline' }
      },
      {
        path: 'create-aircraft',
        component: CreateAircraftComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'airline' }
      },
      {
        path: 'stats',
        component: AirlineStatsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'airline' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AirlineRoutingModule {}
