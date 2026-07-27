import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  phone = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;

    this.auth.register({
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = res.message || 'Account created! You can log in now.';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.error = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = getApiErrorMessage(err, 'Registration failed.');
      }
    });
  }

}
