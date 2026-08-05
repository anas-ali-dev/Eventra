import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {

  token = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.token) {
      this.error = 'Invalid reset link.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.newPassword).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.success = res.message || 'Password reset successfully.';
        } else {
          this.error = res.message || 'Reset failed.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Reset failed.');
        this.cdr.detectChanges();
      }
    });
  }

}
