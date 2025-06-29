import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  declarations: [NavbarComponent, ToastComponent],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [NavbarComponent, ToastComponent  ] 
})

export class SharedModule {}
