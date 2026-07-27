import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ApiResponse, ProfileUpdatePayload, User } from '../shared/models/user.model';
import { AuthService } from './auth.service';
import { EventItem } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/users/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.auth.updateStoredUser(res.data);
        }
      })
    );
  }

  updateProfile(payload: ProfileUpdatePayload): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${environment.apiUrl}/users/me`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.auth.updateStoredUser(res.data);
        }
      })
    );
  }

  getSavedEvents(): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(`${environment.apiUrl}/users/me/saved-events`);
  }

  saveEvent(eventId: number | string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${environment.apiUrl}/users/me/saved-events/${eventId}`,
      {}
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.auth.updateStoredUser(res.data);
        }
      })
    );
  }

  unsaveEvent(eventId: number | string): Observable<ApiResponse<User>> {
    return this.http.delete<ApiResponse<User>>(
      `${environment.apiUrl}/users/me/saved-events/${eventId}`
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.auth.updateStoredUser(res.data);
        }
      })
    );
  }

  isEventSaved(event: EventItem): boolean {
    const user = this.auth.currentUser();
    if (!user?.savedEvents?.length) return false;

    const mongoId = event.mongoId;
    return user.savedEvents.some(id =>
      id === mongoId || id === String(event.id)
    );
  }

}
