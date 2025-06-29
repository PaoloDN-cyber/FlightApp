import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RequestAirlineComponent } from './request-airline/request-airline.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    RequestAirlineComponent,
  ],
  imports: [CommonModule, FormsModule, AuthRoutingModule, RouterModule, ReactiveFormsModule]
})
export class AuthModule {}
