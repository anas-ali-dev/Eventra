import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { getApiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';

    if (!this.email.trim() || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.bookingService.hydrateFromCache();
          void this.bookingService.loadBookings(true);
          this.router.navigate(['/']);
        } else {
          this.error = res.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = getApiErrorMessage(err, 'Invalid email or password.');
      }
    });
  }

}
