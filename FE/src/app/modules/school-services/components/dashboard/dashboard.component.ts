import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';

interface DashboardSummary {
  school: {
    id: string;
    name: string;
  };
  metrics: {
    totalStudents: number;
    todaysAttendance: number;
  };
  recentStudents: Array<{
    id: string;
    full_name: string;
    grade?: string;
    class_name?: string;
    created_at: string;
  }>;
  recentAttendance: Array<{
    id: string;
    student_name?: string;
    grade?: string;
    class_name?: string;
    attendance_date: string;
    check_in_time?: string;
    status: string;
  }>;
}

@Component({
  selector: 'app-school-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = false;
  error = '';
  user: any = null;
  showUserMenu = false;

  constructor(
    private schoolService: SchoolService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadSummary();
  }

  loadUser(): void {
    // Get user from token or API
    const token = this.authService.getToken();
    if (token) {
      // Decode token to get user info (simplified)
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

  loadSummary(): void {
    this.loading = true;
    this.schoolService.getDashboardSummary().subscribe(
      (response) => {
        this.summary = response;
        this.loading = false;
        this.error = '';
      },
      (error) => {
        console.error('Dashboard summary error:', error);
        this.error = error.error?.error || 'Failed to load dashboard summary';
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


