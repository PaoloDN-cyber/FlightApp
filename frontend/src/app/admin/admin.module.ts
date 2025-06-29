import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { AdminUserDetailComponent } from './admin-user-detail/admin-user-detail.component';

import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminUserListComponent,
    AdminUserDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class AdminModule {}
