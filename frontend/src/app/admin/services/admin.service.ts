import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { User } from '../../models/user.model';
import { Airline } from '../../models/airline.model';

export interface ActionResponse {
  message: string;
  tempPassword?: string;
  name?: string;
}
export interface UserAirlineCombined extends 
  Omit<User, '_id'>, 
  Partial<Omit<Airline, '_id'>>
{
  email: string;
  name: string;
  role: string;
  description?: string;
  status?: string;
  createdAt?: string;
}


@Injectable({ providedIn: 'root' })
export class AdminService {
  private Url = environment.apiUrl;
  private apiUrl =`${this.Url}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserAirlineCombined[]> {
    return this.http.get<UserAirlineCombined[]>(`${this.apiUrl}/users`);
  }

  getDetail(email:string): Observable<UserAirlineCombined> {
    return this.http.get<UserAirlineCombined>(`${this.apiUrl}/user-detail/${email}`);
  }

  approveAirline(email:string): Observable<ActionResponse> {
    return this.http.patch<ActionResponse>(`${this.apiUrl}/approve-airline/${email}`, {});
  }

  rejectAirline(email: string): Observable<ActionResponse> {
    return this.http.patch<ActionResponse>(`${this.apiUrl}/reject-airline/${email}`, {});
  }

  sendPasswordChangeReminder(email: string): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${this.apiUrl}/send-reminder/${email}`, {});
  }

  deleteUser(email: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${email}`);
  }

}

