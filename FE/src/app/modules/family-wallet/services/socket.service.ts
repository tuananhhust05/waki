import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly socketUrl = 'http://localhost:3301';

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      const user = this.authService.getUser();
      if (user && user.id) {
        this.joinUserRoom(user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      const user = this.authService.getUser();
      if (user && user.id) {
        this.leaveUserRoom(user.id);
      }
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  leaveUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('leave-user-room', userId);
    }
  }

  onNotification(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        this.connect();
      }

      this.socket?.on('notification', (data: any) => {
        observer.next(data);
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

