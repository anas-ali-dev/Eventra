import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User
} from '../shared/models/user.model';

const TOKEN_KEY = 'eventra_access_token';
const REFRESH_KEY = 'eventra_refresh_token';
const USER_KEY = 'eventra_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  currentUser = signal<User | null>(this.loadUser());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(payload: RegisterPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe();
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  refreshProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/users/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.updateStoredUser(res.data);
        }
      })
    );
  }

  verifyEmail(token: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.get<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/verify-email/${token}`).pipe(
      tap(res => {
        if (res.success && res.data?.accessToken) {
          this.setSession(res.data);
        }
      })
    );
  }

  verifyEmailCode(email: string, code: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/verify-email-code`, {
      email: email.trim().toLowerCase(),
      code: code.replace(/\D/g, '')
    }).pipe(
      tap(res => {
        if (res.success && res.data?.accessToken) {
          this.setSession(res.data);
        }
      })
    );
  }

  resendVerification(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/auth/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${environment.apiUrl}/auth/reset-password/${token}`, {
      newPassword
    });
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  updateStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private setSession(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }

}
