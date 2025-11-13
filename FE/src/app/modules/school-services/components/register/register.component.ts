import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-school-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  full_name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  message = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.message = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.authService.register({
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      password: this.password
    }).subscribe(
      (response) => {
        this.message = response.message || 'Account created successfully';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/school-services/login']), 1500);
      },
      (error) => {
        this.error = error.error?.error || 'Registration failed';
        this.loading = false;
      }
    );
  }
}
