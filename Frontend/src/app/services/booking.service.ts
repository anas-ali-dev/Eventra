import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventService } from './event.service';
import { EventItem } from '../models/event.model';
import { TicketTier } from '../shared/models/venue.model';
import { ApiResponse } from '../shared/models/user.model';
import { AuthService } from './auth.service';

export type BookingStatus = 'upcoming' | 'past' | 'cancelled';

export interface StoredBooking {
  id?: string;
  bookingRef: string;
  eventId: number;
  eventTitle: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  quantity: number;
  total: number;
  ticketTierName?: string;
  status: BookingStatus;
  bookedAt: string;
}

interface ApiBooking {
  _id: string;
  bookingRef: string;
  tickets: number;
  unitPrice: number;
  totalPrice: number;
  ticketTierName?: string;
  status: string;
  createdAt: string;
  event: {
    legacyId?: number;
    title?: string;
    image?: string;
    date?: string;
    time?: string;
    venue?: string;
    city?: string;
    price?: number;
  };
}

const STORAGE_PREFIX = 'eventra_bookings_';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private bookings: StoredBooking[] = [];
  private loadedForUser: string | null = null;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private eventService: EventService
  ) {}

  async loadBookings(force = false): Promise<void> {
    const userId = this.auth.currentUser()?.id;

    if (!this.auth.isLoggedIn() || !userId) {
      this.bookings = [];
      return;
    }

    if (!force && this.loadedForUser === userId && this.bookings.length) {
      return;
    }

    if (!this.bookings.length) {
      this.hydrateFromCache();
    }

    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<ApiBooking[]>>(`${environment.apiUrl}/bookings/me`).pipe(
          timeout(8000),
          catchError(() => of(null))
        )
      );

      if (res?.success && res.data) {
        this.bookings = res.data.map(b => this.mapApiBooking(b));
        this.loadedForUser = userId;
        this.persistForUser(userId);
      }
    } catch {
      if (!this.bookings.length) {
        this.hydrateFromCache();
      }
    }
  }

  getAll(): StoredBooking[] {
    return [...this.bookings];
  }

  getByStatus(status: BookingStatus | 'all'): StoredBooking[] {
    if (status === 'all') {
      return this.getAll();
    }
    return this.bookings.filter(b => b.status === status);
  }

  async addBooking(params: {
    event: EventItem;
    quantity: number;
    total: number;
    bookingRef: string;
    ticketTier?: TicketTier;
    promoCode?: string;
  }): Promise<StoredBooking> {
    const { event, quantity, total, bookingRef, ticketTier, promoCode } = params;

    if (!this.auth.isLoggedIn()) {
      throw new Error('You must be logged in to book tickets.');
    }

    const freshEvent = await this.eventService.ensureEventLoaded(event.id);
    const target = freshEvent ?? event;
    const eventRef = target.mongoId || target.id;

    const res = await firstValueFrom(
      this.http.post<ApiResponse<ApiBooking>>(`${environment.apiUrl}/bookings`, {
        event: eventRef,
        tickets: quantity,
        ticketTierId: ticketTier?._id || '',
        ticketTierSlug: ticketTier?.slug || '',
        ticketTierName: ticketTier?.name,
        unitPrice: ticketTier?.price ?? target.price,
        promoCode
      }).pipe(
        timeout(10000),
        catchError(() => of(null))
      )
    );

    if (!res) {
      throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
    }

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Booking failed. Please try again.');
    }

    const booking = this.mapApiBooking(res.data);
    this.bookings.unshift(booking);
    this.loadedForUser = this.auth.currentUser()?.id ?? null;

    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.persistForUser(userId);
    }

    await this.eventService.refreshFromApi(target.id);

    return booking;
  }

  async cancelBooking(bookingRef: string): Promise<boolean> {
    const booking = this.bookings.find(b => b.bookingRef === bookingRef);

    if (!booking || booking.status !== 'upcoming') {
      return false;
    }

    if (!booking.id) {
      return false;
    }

    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/bookings/cancel/${booking.id}`, {}).pipe(
        timeout(8000)
      )
    );

    booking.status = 'cancelled';

    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.persistForUser(userId);
    }

    if (booking.eventId) {
      await this.eventService.refreshFromApi(booking.eventId);
    }

    return true;
  }

  removeBooking(bookingRef: string): void {
    this.bookings = this.bookings.filter(b => b.bookingRef !== bookingRef);

    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.persistForUser(userId);
    }
  }

  hasBookingForEvent(eventId: number): boolean {
    return this.bookings.some(
      b => b.eventId === eventId && b.status === 'upcoming'
    );
  }

  getBookingsCount(): number {
    return this.bookings.filter(b => b.status !== 'cancelled').length;
  }

  /** Show cached bookings instantly while refreshing from API. */
  hydrateFromCache(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.bookings = [];
      return;
    }

    try {
      const raw = localStorage.getItem(this.storageKey(userId));
      if (raw) {
        this.bookings = JSON.parse(raw) as StoredBooking[];
        this.loadedForUser = userId;
      }
    } catch {
      this.bookings = [];
    }
  }

  clearOnLogout(): void {
    this.bookings = [];
    this.loadedForUser = null;
  }

  generateRef(): string {
    return 'EVT-' + Math.floor(100000 + Math.random() * 900000);
  }

  private mapApiBooking(raw: ApiBooking): StoredBooking {
    const event = raw.event || {};
    const dateStr = event.date?.includes('T')
      ? event.date.split('T')[0]
      : (event.date || '');

    return {
      id: raw._id,
      bookingRef: raw.bookingRef,
      eventId: event.legacyId ?? 0,
      eventTitle: event.title || 'Event',
      image: event.image || '',
      date: dateStr,
      time: event.time || '',
      venue: [event.venue, event.city].filter(Boolean).join(', '),
      price: raw.unitPrice ?? event.price ?? 0,
      quantity: raw.tickets,
      total: raw.totalPrice,
      ticketTierName: raw.ticketTierName,
      status: raw.status === 'Cancelled'
        ? 'cancelled'
        : this.resolveStatus(dateStr),
      bookedAt: raw.createdAt
    };
  }

  private storageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  private persistForUser(userId: string): void {
    localStorage.setItem(this.storageKey(userId), JSON.stringify(this.bookings));
  }

  private resolveStatus(isoDate: string): BookingStatus {
    if (!isoDate) return 'upcoming';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(isoDate + 'T00:00:00');
    return eventDate >= today ? 'upcoming' : 'past';
  }

}
