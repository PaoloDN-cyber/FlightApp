    import { Component, Input, OnInit } from '@angular/core';
    import { ToastService } from '../services/notification.service';

    @Component({
      selector: 'app-toast',
      templateUrl: './toast.component.html',
      styleUrls: ['./toast.component.css']
    })
    export class ToastComponent implements OnInit {
      @Input() toasts: any[] = [];

      constructor(private notification: ToastService) { }

      ngOnInit(): void {
        this.notification.getToasts().subscribe(toast => {
          this.toasts.push(toast);
        });
      }

      removeToast(toast: any): void {
        this.toasts = this.toasts.filter(t => t !== toast);
      }
    }