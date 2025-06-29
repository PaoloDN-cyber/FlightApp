import { Injectable } from '@angular/core';
import { io, Socket }  from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private readonly url = environment.socketUrl;

  connect(token?: string): void {
    if (this.socket) this.disconnect();
    this.socket = io(this.url, { auth: { token } });
    this.socket.on('connect',       () => console.log('🔌 Socket connected:', this.socket?.id));
    this.socket.on('connect_error', err => console.error('❌ Socket error:', err.message));
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    console.log('⛔️ Socket disconnected');
  }

  joinFlightRoom(flightId: string, classType: string): void {
    this.socket?.emit('joinFlightRoom', { flightId, classType });
  }

  leaveFlightRoom(flightId: string, classType: string): void {
    this.socket?.emit('leaveFlightRoom', { flightId, classType });
  }

  selectSeat(flightId: string, classType: string, seatId: string): void {
    this.socket?.emit('selectSeat', { flightId, classType, seatId });
  }

  deselectSeat(flightId: string, classType: string, seatId: string): void {
    this.socket?.emit('deselectSeat', { flightId, classType, seatId });
  }

  confirmBooking(flightId: string, classType: string, seats: string[]): void {
    this.socket?.emit('confirmBooking', { flightId, classType, seats });
  }

  on(event: string, cb: (...args: any[]) => void): void {
    this.socket?.on(event, cb);
  }

  off(event: string): void {
    this.socket?.off(event);
  }
}
