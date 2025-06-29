import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RequestAirlineComponent } from './request-airline/request-airline.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard.component';
import { AirlineDashboardComponent } from '../airline/airline-dashboard/airline-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'request-airline', component: RequestAirlineComponent },
  { 
    path: 'change-password', 
    //canActivate: [AuthGuard, RoleGuard],
    //data: { expectedRole: 'airline' },
    component: ChangePasswordComponent
  },
//{
  //path: 'admin',
  //canActivate: [AuthGuard, RoleGuard],
  //data: { expectedRole: 'admin' },
  //children: [
    //{ path: 'dashboard', component: AdminDashboardComponent },
  //]
//},
//{
 // path: 'airline',
  //canActivate: [AuthGuard, RoleGuard],
  //data: { expectedRole: 'airline' },
  //children: [
   // { path: 'dashboard', component: AirlineDashboardComponent },
  //]
//},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
