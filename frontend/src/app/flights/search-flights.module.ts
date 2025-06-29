import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchFlightsComponent } from './search-flights.component';
import { SearchFlightsRoutingModule } from './search-flights-routing.module';
import { SearchFlightsService } from './search-flights.service';

@NgModule({
  declarations: [SearchFlightsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SearchFlightsRoutingModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [SearchFlightsService]
})
export class SearchFlightsModule {}
