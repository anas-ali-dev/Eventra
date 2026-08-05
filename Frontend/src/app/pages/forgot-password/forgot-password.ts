import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {

  email = '';
  error = '';
  success = '';
  devResetLink = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.email.trim()) {
      this.error = 'Please enter your email address.';
      return;
    }

    this.loading = true;
    this.devResetLink = '';

    this.auth.forgotPassword(this.email.trim()).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.success = res.message || 'Check your email for a reset link.';
          const link = (res.data as { devResetLink?: string } | undefined)?.devResetLink;
          this.devResetLink = link || '';
        } else {
          this.error = res.message || 'Request failed.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Request failed.');
        this.cdr.detectChanges();
      }
    });
  }

}
