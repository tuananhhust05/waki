import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-school-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.resetAuthState();
    this.authService.login({ email: this.email, password: this.password }).subscribe(
      () => this.router.navigate(['/school-services/dashboard']),
      (error) => this.error = error.error?.error || 'Login failed'
    );
  }
}


