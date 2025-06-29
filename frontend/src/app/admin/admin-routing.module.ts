import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { AdminUserDetailComponent } from './admin-user-detail/admin-user-detail.component';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        component: AdminUserListComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'user-list',
        component: AdminUserListComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'user-detail/:email',
        component: AdminUserDetailComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'search',
        component: AdminUserDetailComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'admin' }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],  
  exports: [RouterModule]                  
})
export class AdminRoutingModule {}


