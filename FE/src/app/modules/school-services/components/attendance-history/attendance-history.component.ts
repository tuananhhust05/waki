import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.css']
})
export class AttendanceHistoryComponent implements OnInit {
  records: any[] = [];
  loading = false;
  error = '';
  user: any = null;
  showUserMenu = false;

  constructor(
    private schoolService: SchoolService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadHistory();
  }

  loadUser(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.user = {
          id: payload.id,
          email: payload.email,
          full_name: payload.full_name || 'School Admin'
        };
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  loadHistory(): void {
    this.loading = true;
    this.schoolService.getAttendanceHistory().subscribe(
      (response) => {
        this.records = response.records || [];
        this.loading = false;
      },
      (error) => {
        this.error = error.error?.error || 'Failed to load attendance history';
        this.loading = false;
      }
    );
  }

  logout(): void {
    this.authService.clearToken();
    this.router.navigate(['/school-services/login']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
