import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SocketService } from '../../shared/services/socket.service';
import { environment } from '../../../environments/environment';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  private tokenReady$ = new BehaviorSubject<boolean>(false);
  private currentUser: any;
  
  constructor(private http: HttpClient, private router: Router,  private socketService: SocketService ) {
    if (this.isLoggedIn()) {
    this.tokenReady$.next(true);
  }
  }

  login(credentials: { email: string; password: string }) :  Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
    tap((response: any) => {
      /* 1. salva il token */
      localStorage.setItem('token', response.token);

      console.log('✅ saved token:', response.token);


      /* 2. avvisa i componenti che il token è pronto */
      this.tokenReady$.next(true);

      /* 3. apri il websocket */
      this.socketService.connect(response.token);
    })
  );
}
  
waitForToken(): Observable<boolean> {
  return this.tokenReady$.pipe(
    filter(Boolean),   // lascia passare solo true
    take(1)            // completa dopo il primo
  );
}
  register(data: { name: string; email: string; password: string }) :  Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  registerAirline(data: { name: string; email: string; description?: string }) {
    return this.http.post(`${this.apiUrl}/airline/request`, data);
  }

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data);
  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired();
  }


  logout(): void {
    localStorage.removeItem('token');
    this.currentUser = null;
    this.socketService.disconnect(); 
    this.router.navigate(['/auth/login']);  // <== redirect automatico
  }

  getTokenExpiration(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 /* sec → ms */ : null;
    } catch {
    // token malformato: meglio trattarlo come non valido
    return null;
  }
  }

  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    return expiration ? Date.now() > expiration : true;
  }

getCurrentUser(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      airlineId: payload.airlineId,
      id: payload.id,
      status: payload.status
    };
  } catch (err) {
    console.error('Errore nel parsing del token:', err);
    return null;
  }
}
getUserRole(): string | null {
  const user = this.getCurrentUser();
  return user ? user.role : null;
}

}
