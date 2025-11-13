import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class SchoolService {
  private apiUrl = 'https://waki.autos/api/school-services';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/my-students`, { headers: this.getHeaders() });
  }

  createStudent(data: {
    full_name: string;
    grade?: string;
    class_name?: string;
    photo_base64: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/students`, data, { headers: this.getHeaders() });
  }

  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/summary`, { headers: this.getHeaders() });
  }

  getAttendanceHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/school/history`, { headers: this.getHeaders() });
  }

  checkInStudent(data: { student_id?: string; image_base64?: string; status?: string; notes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/check-in`, data, { headers: this.getHeaders() });
  }
}


