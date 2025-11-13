import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost:3301/api/school-services';
  private tokenKey = 'school_token';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) localStorage.setItem(this.tokenKey, response.token);
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  resetAuthState(): void {
    try {
      localStorage.clear();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      if (typeof document !== 'undefined') {
        const cookies = document.cookie ? document.cookie.split(';') : [];
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }
    } catch (error) {
      console.warn('Failed to reset auth state', error);
    }
  }
}


