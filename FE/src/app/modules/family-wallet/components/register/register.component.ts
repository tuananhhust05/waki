import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fw-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  full_name: string = '';
  phone: string = '';
  role: string = 'parent';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.authService.register({
      email: this.email,
      password: this.password,
      full_name: this.full_name,
      phone: this.phone,
      role: this.role
    }).subscribe(
      () => this.router.navigate(['/family-wallet/dashboard']),
      (error) => this.error = error.error?.error || 'Registration failed'
    );
  }
}


