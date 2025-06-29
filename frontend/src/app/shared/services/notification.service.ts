    import { Injectable } from '@angular/core';
    import { Subject } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class ToastService {
      private toastSubject = new Subject<any>();

      constructor() { }

      show(title: string, message: string): void {
        const toast = {
          title: title,
          message: message,
          timestamp: new Date()
        };
        this.toastSubject.next(toast);
      }

      getToasts() {
        return this.toastSubject.asObservable();
      }
    }

