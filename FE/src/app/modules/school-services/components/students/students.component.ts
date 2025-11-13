import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-school-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
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
    this.loadStudents();
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

  loadStudents(): void {
    this.loading = true;
    this.schoolService.getStudents().subscribe(
      (response) => {
        this.students = response.students || [];
        this.loading = false;
      },
      (error) => {
        this.error = error.error?.error || 'Failed to load students';
        this.loading = false;
      }
    );
  }

  goToCreate(): void {
    this.router.navigate(['/school-services/students/create']);
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
}
