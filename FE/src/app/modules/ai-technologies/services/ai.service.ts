import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AIService {
  private apiUrl = 'http://localhost:3301/api/ai-technologies';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getInsights(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai/insights`, { headers: this.getHeaders() });
  }
}


