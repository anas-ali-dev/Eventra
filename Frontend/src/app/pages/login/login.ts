import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { EventService } from '../../services/event.service';
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
  info = '';
  loading = false;
  resendLoading = false;
  showResendVerification = false;

  constructor(
    private auth: AuthService,
    private bookingService: BookingService,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.error = '';
    this.info = '';
    this.showResendVerification = false;

    if (!this.email.trim() || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.auth.login({ email: this.email.trim().toLowerCase(), password: this.password }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.bookingService.hydrateFromCache();
          void this.bookingService.loadBookings(true);
          void this.eventService.refreshFromApi();
          void this.router.navigate(['/']);
        } else {
          this.error = res.message || 'Login failed.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = getApiErrorMessage(err, 'Invalid email or password.');
        const data = err.error?.data as {
          email?: string;
          devVerificationCode?: string;
          emailSent?: boolean;
          requiresVerification?: boolean;
        } | undefined;

        const needsVerify =
          err.status === 403 ||
          data?.requiresVerification ||
          msg.toLowerCase().includes('verif');

        if (needsVerify) {
          this.showResendVerification = true;
          this.info = msg;
          this.error = '';
          const targetEmail = data?.email || this.email.trim().toLowerCase();
          const queryParams: Record<string, string> = { email: targetEmail };
          if (data?.devVerificationCode) {
            queryParams['devCode'] = data.devVerificationCode;
          }
          if (data?.emailSent) {
            queryParams['sent'] = '1';
          }
          void this.router.navigate(['/verify-email'], { queryParams });
          this.cdr.detectChanges();
          return;
        }

        this.error = msg;
        this.cdr.detectChanges();
      }
    });
  }

  resendVerification(): void {
    if (!this.email.trim()) {
      this.error = 'Enter your email above, then click resend verification.';
      return;
    }

    this.resendLoading = true;
    this.info = '';

    this.auth.resendVerification(this.email.trim()).pipe(
      finalize(() => {
        this.resendLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.info = res.message || 'Verification email sent.';
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Could not resend verification email.');
        this.cdr.detectChanges();
      }
    });
  }

}
