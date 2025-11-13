import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3301/api/family-wallet/payments';

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

  // Process payment via Mastercard/Visa
  processPayment(paymentData: {
    amount: number;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    cardType: 'mastercard' | 'visa';
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-payment`, paymentData, {
      headers: this.getHeaders()
    });
  }

  // Transfer money from parent to child
  transferToChild(data: {
    childUserId: string;
    amount: number;
    description?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer-to-child`, data, {
      headers: this.getHeaders()
    });
  }

  // Child makes a payment
  childPayment(data: {
    amount: number;
    merchant?: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/child-payment`, data, {
      headers: this.getHeaders()
    });
  }

  // Create expense (for both parent and child)
  createExpense(data: {
    amount: number;
    merchant?: string;
    description?: string;
    category?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-expense`, data, {
      headers: this.getHeaders()
    });
  }
}

