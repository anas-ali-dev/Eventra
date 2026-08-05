import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { finalize, timeout } from 'rxjs';



import { NavbarComponent } from '../../components/navbar/navbar';

import { FooterComponent } from '../../components/footer/footer';

import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';

import { AuthService } from '../../services/auth.service';

import { BookingService } from '../../services/booking.service';

import { EventService } from '../../services/event.service';

import { getApiErrorMessage } from '../../shared/utils/api-error';



@Component({

  selector: 'app-verify-email',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    RouterLink,

    NavbarComponent,

    FooterComponent,

    PageBackdropComponent

  ],

  templateUrl: './verify-email.html',

  styleUrl: './verify-email.css'

})

export class VerifyEmailComponent implements OnInit {



  loading = false;

  tokenLoading = false;

  success = false;

  message = '';

  email = '';

  code = '';

  devCode = '';

  emailSent = false;

  resendLoading = false;

  showCodeForm = false;



  constructor(

    private route: ActivatedRoute,

    private router: Router,

    readonly auth: AuthService,

    private bookingService: BookingService,

    private eventService: EventService,

    private cdr: ChangeDetectorRef

  ) {}



  ngOnInit(): void {

    const token = this.route.snapshot.paramMap.get('token');

    const emailQuery = this.route.snapshot.queryParamMap.get('email');

    const devCodeQuery = this.route.snapshot.queryParamMap.get('devCode');

    const sentQuery = this.route.snapshot.queryParamMap.get('sent');



    if (emailQuery) {

      this.email = emailQuery.trim().toLowerCase();

    }



    if (devCodeQuery) {

      this.devCode = devCodeQuery;

    }



    if (sentQuery === '1') {

      this.emailSent = true;

    }



    if (token) {

      this.tokenLoading = true;

      this.auth.verifyEmail(token).pipe(

        timeout(8000),

        finalize(() => {

          this.tokenLoading = false;

          this.cdr.detectChanges();

        })

      ).subscribe({

        next: (res) => {

          this.handleVerificationSuccess(res);

        },

        error: (err) => {

          this.message = getApiErrorMessage(err, 'Verification failed.');

          this.showCodeForm = true;

          this.cdr.detectChanges();

        }

      });

      return;

    }



    this.showCodeForm = true;

  }



  onCodeInput(): void {

    const digits = this.code.replace(/\D/g, '');

    if (digits.length === 6 && !this.loading && !this.success) {

      this.submitCode();

    }

  }



  submitCode(): void {

    this.message = '';



    const normalizedCode = this.code.replace(/\D/g, '');



    if (!this.email.trim() || normalizedCode.length !== 6) {

      this.message = 'Enter your email and a valid 6-digit verification code.';

      return;

    }



    this.loading = true;

    this.cdr.detectChanges();



    this.auth.verifyEmailCode(this.email, normalizedCode).pipe(

      timeout(8000),

      finalize(() => {

        this.loading = false;

        this.cdr.detectChanges();

      })

    ).subscribe({

      next: (res) => {

        this.handleVerificationSuccess(res);

      },

      error: (err) => {

        this.success = false;

        this.message = getApiErrorMessage(err, 'Verification failed.');

        if (this.message.toLowerCase().includes('invalid') || this.message.toLowerCase().includes('expired')) {

          this.message += ' Click "Resend verification code" for a fresh code.';

        }

        this.cdr.detectChanges();

      }

    });

  }



  resendCode(): void {

    if (!this.email.trim()) {

      this.message = 'Enter your email address first.';

      return;

    }



    this.resendLoading = true;

    this.message = '';

    this.cdr.detectChanges();



    this.auth.resendVerification(this.email.trim()).pipe(

      timeout(8000),

      finalize(() => {

        this.resendLoading = false;

        this.cdr.detectChanges();

      })

    ).subscribe({

      next: (res) => {

        this.message = res.message || 'Verification code sent.';

        const data = res.data as {

          devVerificationCode?: string;

          emailSent?: boolean;

        } | undefined;

        if (data?.devVerificationCode) {

          this.devCode = data.devVerificationCode;

        }

        if (data?.emailSent) {

          this.emailSent = true;

        }

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.message = getApiErrorMessage(err, 'Could not resend verification code.');

        const devCode = err.error?.data?.devVerificationCode as string | undefined;

        if (devCode) {

          this.devCode = devCode;

        }

        this.cdr.detectChanges();

      }

    });

  }



  private handleVerificationSuccess(res: { success?: boolean; message?: string }): void {

    this.success = !!res.success;

    this.showCodeForm = !this.success;

    this.message = res.message || (this.success

      ? 'Email verified! Taking you to Eventra...'

      : 'Verification failed.');



    if (this.success && this.auth.isLoggedIn()) {

      this.bookingService.hydrateFromCache();

      void this.bookingService.loadBookings(true);

      void this.eventService.refreshFromApi();

      setTimeout(() => this.router.navigate(['/']), 800);

    } else if (this.success) {

      setTimeout(() => this.router.navigate(['/login']), 1500);

    }



    this.cdr.detectChanges();

  }

}


