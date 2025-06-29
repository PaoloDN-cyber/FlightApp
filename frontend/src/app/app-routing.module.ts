import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { 
  path: 'airline', 
  loadChildren: () => import('./airline/airline.module').then(m => m.AirlineModule) 
  },
  {
  path: 'search-flights',
  loadChildren: () => import('./flights/search-flights.module').then(m => m.SearchFlightsModule)
  },
 { 
  path: 'tickets', 
  loadChildren: () => import('./ticket/ticket.module').then(m => m.TicketModule) 
  },

  // Wildcard per gestione 404
  { path: '**', redirectTo: '/auth/login' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
