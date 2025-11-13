import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3301/api/family-wallet/notifications';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all notifications
  getNotifications(isRead?: boolean, limit: number = 50): Observable<any> {
    let url = `${this.apiUrl}?limit=${limit}`;
    if (isRead !== undefined) {
      url += `&is_read=${isRead}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Get single notification
  getNotification(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create notification
  createNotification(data: {
    family_id: string;
    type: string;
    title: string;
    message: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  // Update notification
  updateNotification(id: string, data: {
    is_read?: boolean;
    title?: string;
    message?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {}, { headers: this.getHeaders() });
  }

  // Delete notification
  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Delete all notifications
  deleteAllNotifications(): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getHeaders() });
  }
}

