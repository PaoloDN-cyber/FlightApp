import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AirlineRoutingModule } from './airline-routing.module';
import { AirlineDashboardComponent } from './airline-dashboard/airline-dashboard.component';
import { CreateRouteComponent } from './create-route/create-route.component';
import { CreateFlightComponent } from './create-flight/create-flight.component';
import { CreateAircraftComponent } from './create-aircraft/create-aircraft.component';
import { AirlineStatsComponent } from './airline-stats/airline-stats.component';

@NgModule({
  declarations: [
    AirlineDashboardComponent,
    CreateRouteComponent,
    CreateFlightComponent,
    CreateAircraftComponent,
    AirlineStatsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    AirlineRoutingModule,
    HttpClientModule
  ]
})
export class AirlineModule {}
