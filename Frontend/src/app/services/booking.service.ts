import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventService } from './event.service';
import { EventItem } from '../models/event.model';
import { TicketTier } from '../shared/models/venue.model';
import { ApiResponse } from '../shared/models/user.model';
import { AuthService } from './auth.service';
import { getApiErrorMessage } from '../shared/utils/api-error';

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

/** Same event grouped for My Bookings — different tiers stack together. */
export interface GroupedBookingTier {
  ticketTierName: string;
  quantity: number;
  total: number;
  bookingRef: string;
}

export interface GroupedBooking extends StoredBooking {
  bookingRefs: string[];
  bookingIds: string[];
  tiers: GroupedBookingTier[];
}

export interface DigitalTicket {
  bookingRef: string;
  tickets: number;
  ticketTierName: string;
  unitPrice: number;
  totalPrice: number;
  status: string;
  holderName: string;
  holderEmail: string;
  entryGate: string;
  section: string;
  zone: string;
  passes?: TicketPass[];
  event: {
    legacyId?: number;
    title: string;
    image: string;
    banner: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    venueAddress: string;
  };
}

export interface TicketPass {
  passCode: string;
  passNumber: number;
  passesInBooking: number;
  bookingRef: string;
  ticketTierName: string;
  unitPrice: number;
  totalPrice: number;
  status: string;
  holderName: string;
  holderEmail: string;
  entryGate: string;
  section: string;
  zone: string;
  event: DigitalTicket['event'];
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
    _id?: string;
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
const BOOKING_TIMEOUT_MS = 15000;
const API_TIMEOUT_MS = 10000;

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
          timeout(API_TIMEOUT_MS)
        )
      );

      if (res?.success && Array.isArray(res.data)) {
        this.bookings = res.data.map(b => this.mapApiBooking(b));
        this.loadedForUser = userId;
        this.persistForUser(userId);
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.clearUserCache(userId);
        return;
      }

      if (!this.bookings.length) {
        this.hydrateFromCache();
      }
    }
  }

  getAll(): StoredBooking[] {
    return [...this.bookings];
  }

  clearStoredBookings(): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.clearUserCache(userId);
    } else {
      this.bookings = [];
      this.loadedForUser = null;
    }
  }

  /** Combine bookings for the same event into one stackable card. */
  getGrouped(bookings = this.bookings): GroupedBooking[] {
    const groups = new Map<string, GroupedBooking>();

    for (const booking of bookings) {
      if (booking.status === 'cancelled') {
        groups.set(`cancelled-${booking.bookingRef}`, {
          ...booking,
          bookingRefs: [booking.bookingRef],
          bookingIds: booking.id ? [booking.id] : [],
          tiers: [{
            ticketTierName: booking.ticketTierName || 'General Admission',
            quantity: booking.quantity,
            total: booking.total,
            bookingRef: booking.bookingRef
          }]
        });
        continue;
      }

      const key = `${booking.eventId}|${booking.status}`;
      const existing = groups.get(key);

      const tierLine: GroupedBookingTier = {
        ticketTierName: booking.ticketTierName || 'General Admission',
        quantity: booking.quantity,
        total: booking.total,
        bookingRef: booking.bookingRef
      };

      if (existing) {
        existing.quantity += booking.quantity;
        existing.total += booking.total;
        existing.bookingRefs.push(booking.bookingRef);
        existing.tiers.push(tierLine);
        if (booking.id) {
          existing.bookingIds.push(booking.id);
        }
        if (booking.bookedAt > existing.bookedAt) {
          existing.bookedAt = booking.bookedAt;
        }
      } else {
        groups.set(key, {
          ...booking,
          bookingRefs: [booking.bookingRef],
          bookingIds: booking.id ? [booking.id] : [],
          tiers: [tierLine]
        });
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );
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

    const target = event.mongoId
      ? event
      : (await this.eventService.refreshEvent(event.id) ?? event);
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
        timeout(BOOKING_TIMEOUT_MS)
      )
    ).catch((err: unknown) => {
      throw new Error(getApiErrorMessage(err, 'Booking failed. Please try again.'));
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Booking failed. Please try again.');
    }

    const booking = this.mapApiBooking(res.data);
    const existingIndex = this.bookings.findIndex(b => b.id === booking.id);

    if (existingIndex >= 0) {
      this.bookings[existingIndex] = booking;
    } else {
      this.bookings.unshift(booking);
    }
    this.loadedForUser = this.auth.currentUser()?.id ?? null;

    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.persistForUser(userId);
    }

    void this.eventService.refreshEvent(target.id);

    return booking;
  }

  async cancelGroupedBooking(bookingRefs: string[]): Promise<void> {
    for (const ref of bookingRefs) {
      await this.cancelBooking(ref);
    }
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
      await this.eventService.refreshEvent(booking.eventId);
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

  /** Active booking groups (same event combined). */
  getGroupedBookingsCount(): number {
    const active = this.bookings.filter(b => b.status !== 'cancelled');
    return this.getGrouped(active).length;
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
        this.bookings = (JSON.parse(raw) as StoredBooking[])
          .filter(booking => !!booking.id && !!booking.bookingRef);
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

  async getTicketPasses(refs: string[]): Promise<TicketPass[]> {
    const uniqueRefs = [...new Set(refs.map(ref => ref.trim()).filter(Boolean))];

    if (!uniqueRefs.length) {
      throw new Error('Booking reference is required.');
    }

    const res = await firstValueFrom(
      this.http.get<ApiResponse<{ passes: TicketPass[]; totalPasses: number }>>(
        `${environment.apiUrl}/bookings/tickets?refs=${encodeURIComponent(uniqueRefs.join(','))}`
      ).pipe(
        timeout(API_TIMEOUT_MS)
      )
    ).catch((err: unknown) => {
      throw new Error(getApiErrorMessage(err, 'Could not load tickets.'));
    });

    if (!res.success || !res.data?.passes?.length) {
      throw new Error(
        res.message || 'Tickets not found. Refresh My Bookings and try again.'
      );
    }

    return res.data.passes;
  }

  async getTicket(bookingRef: string): Promise<DigitalTicket> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<DigitalTicket>>(
        `${environment.apiUrl}/bookings/ticket/${encodeURIComponent(bookingRef)}`
      ).pipe(
        timeout(API_TIMEOUT_MS)
      )
    ).catch((err: unknown) => {
      throw new Error(getApiErrorMessage(err, 'Could not load ticket.'));
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Ticket not found.');
    }

    return res.data;
  }

  private mapApiBooking(raw: ApiBooking): StoredBooking {
    const event = raw.event || ({} as ApiBooking['event']);
    const dateStr = event.date?.includes('T')
      ? event.date.split('T')[0]
      : (event.date || '');

    let eventId = event.legacyId ?? 0;

    if (!eventId) {
      const mongoId = (event as { _id?: string })._id;
      if (mongoId) {
        const match = this.eventService.getAll().find(e => e.mongoId === mongoId);
        eventId = match?.id ?? 0;
      }
    }

    return {
      id: raw._id,
      bookingRef: raw.bookingRef,
      eventId,
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

  private clearUserCache(userId: string): void {
    this.bookings = [];
    this.loadedForUser = null;
    localStorage.removeItem(this.storageKey(userId));
  }

  private resolveStatus(isoDate: string): BookingStatus {
    if (!isoDate) return 'upcoming';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(isoDate + 'T00:00:00');
    return eventDate >= today ? 'upcoming' : 'past';
  }

}
