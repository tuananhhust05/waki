import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'https://waki.autos/api/family-wallet';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getMyWallet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallets/my-wallet`, { headers: this.getHeaders() });
  }

  getFamilyWallets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallets/family-wallets`, { headers: this.getHeaders() });
  }

  addFunds(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallets/add-funds`, data, { headers: this.getHeaders() });
  }

  getTransactions(limit?: number, offset?: number): Observable<any> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get(`${this.apiUrl}/wallets/transactions`, { headers: this.getHeaders(), params });
  }
}


