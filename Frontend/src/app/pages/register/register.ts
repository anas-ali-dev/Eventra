import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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
export class RegisterComponent implements OnInit {

  name = '';
  email = '';
  phone = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('deleted') === '1') {
      this.success = 'Your account was deleted. You can register again with the same email.';
    }
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.loading = true;

    this.auth.register({
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.success = res.message || 'Account created! You can log in now.';
          const data = res.data as {
            email?: string;
            devVerificationCode?: string;
            emailSent?: boolean;
            requiresVerification?: boolean;
          } | undefined;
          const needsVerification =
            data?.requiresVerification ||
            !!(data?.devVerificationCode) ||
            (res.message || '').toLowerCase().includes('verif');

          if (needsVerification) {
            const queryParams: Record<string, string> = {
              email: data?.email || this.email.trim().toLowerCase()
            };
            if (data?.devVerificationCode) {
              queryParams['devCode'] = data.devVerificationCode;
            }
            if (data?.emailSent) {
              queryParams['sent'] = '1';
            }
            void this.router.navigate(['/verify-email'], { queryParams });
          } else {
            setTimeout(() => this.router.navigate(['/login']), 1500);
          }
        } else {
          this.error = res.message || 'Registration failed.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Registration failed.');
        this.cdr.detectChanges();
      }
    });
  }

}
