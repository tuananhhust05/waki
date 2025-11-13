import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private apiUrl = 'https://waki.autos/api/family-wallet';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getMyFamily(): Observable<any> {
    return this.http.get(`${this.apiUrl}/families/my-family`, { headers: this.getHeaders() });
  }

  addMember(memberData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/families/members`, memberData, { headers: this.getHeaders() });
  }
}


