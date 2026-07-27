import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventItem } from '../models/event.model';
import { ApiResponse } from '../shared/models/user.model';
import { TicketTier } from '../shared/models/venue.model';
import { MOCK_EVENTS } from '../data/event.mock-data';

interface ApiEvent {
  _id: string;
  legacyId?: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue?: string;
  city?: string;
  location?: string;
  price: number;
  availableTickets: number;
  image?: string;
  banner?: string;
  imagePosition?: string;
  bannerPosition?: string;
  cardImagePosition?: string;
  heroCardAlign?: 'left' | 'right';
  bannerSize?: string;
  heroLayout?: 'side' | 'bottom';
  heroCardCompact?: boolean;
  rating?: number;
  categoryName?: string;
  category?: { name?: string } | string;
  ticketTiers?: TicketTier[];
  venueRef?: { name?: string; city?: string; ticketTiers?: TicketTier[] };
}

@Injectable({ providedIn: 'root' })
export class EventService {

  private events: EventItem[] = [...MOCK_EVENTS];
  private initialized = false;

  constructor(private http: HttpClient) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.refreshFromApi();
    this.initialized = true;
  }

  /** Reload one event or all events from the API (updates ticket counts). */
  async refreshFromApi(legacyId?: number): Promise<void> {
    try {
      if (legacyId) {
        const res = await firstValueFrom(
          this.http.get<ApiResponse<ApiEvent>>(`${environment.apiUrl}/events/${legacyId}`).pipe(
            timeout(5000),
            catchError(() => of(null))
          )
        );

        if (res?.success && res.data) {
          const updated = this.mapApiEvent(res.data);
          const index = this.events.findIndex(e => e.id === updated.id);

          if (index >= 0) {
            this.events[index] = updated;
          } else {
            this.events.push(updated);
          }
        }

        return;
      }

      const res = await firstValueFrom(
        this.http.get<ApiResponse<ApiEvent[]>>(`${environment.apiUrl}/events`).pipe(
          timeout(5000),
          catchError(() => of(null))
        )
      );

      if (res?.success && res.data?.length) {
        this.events = res.data.map(e => this.mapApiEvent(e));
      }
    } catch {
      if (!this.initialized) {
        this.events = [...MOCK_EVENTS];
      }
    }
  }

  /** Ensure a single event has mongoId + live ticket data before booking. */
  async ensureEventLoaded(legacyId: number): Promise<EventItem | undefined> {
    await this.refreshFromApi(legacyId);
    return this.getById(legacyId);
  }

  getAll(): EventItem[] {
    return this.events;
  }

  getById(id: number): EventItem | undefined {
    return this.events.find(event => event.id === id);
  }

  getByCategory(category: string): EventItem[] {
    return this.events.filter(event => event.category === category);
  }

  search(term: string): EventItem[] {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    return this.events.filter(event =>
      event.title.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      event.venue.toLowerCase().includes(q) ||
      event.city.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q)
    );
  }

  getTrending(): EventItem[] {
    return [...this.events]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  getHeroSlides(): EventItem[] {
    return this.getEventsByIds([6, 1, 2, 5, 11]);
  }

  getFeaturedConcerts(): EventItem[] {
    return this.getEventsByIds([6, 1, 2, 5, 11, 3, 4]);
  }

  private getEventsByIds(ids: number[]): EventItem[] {
    return ids
      .map(id => this.getById(id))
      .filter((event): event is EventItem => !!event);
  }

  getConcerts(): EventItem[] {
    return this.getByCategory('Concert');
  }

  getSports(): EventItem[] {
    return this.getByCategory('Sports');
  }

  getFestivals(): EventItem[] {
    return this.getByCategory('Festival');
  }

  getStreaming(): EventItem[] {
    return this.getByCategory('Streaming');
  }

  getComedy(): EventItem[] {
    return this.getByCategory('Comedy');
  }

  getTheatre(): EventItem[] {
    return this.getByCategory('Theatre');
  }

  getTechnology(): EventItem[] {
    return this.getByCategory('Technology');
  }

  getCategories(): string[] {
    return [...new Set(this.events.map(event => event.category))];
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate.includes('T') ? isoDate : isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private mapApiEvent(raw: ApiEvent): EventItem {
    const legacyId = raw.legacyId ?? 0;
    const mock = MOCK_EVENTS.find(m => m.id === legacyId);
    const category = raw.categoryName
      || (typeof raw.category === 'object' ? raw.category?.name : raw.category)
      || mock?.category
      || 'Concert';

    const dateStr = raw.date.includes('T')
      ? raw.date.split('T')[0]
      : raw.date;

    const tiers = raw.ticketTiers?.length
      ? raw.ticketTiers
      : raw.venueRef?.ticketTiers?.length
        ? raw.venueRef.ticketTiers
        : mock?.ticketTiers;

    return {
      id: legacyId || mock?.id || 0,
      mongoId: raw._id,
      title: raw.title,
      category,
      date: dateStr,
      time: raw.time || mock?.time || '8:00 PM',
      venue: raw.venue || mock?.venue || '',
      city: raw.city || mock?.city || '',
      price: raw.price,
      image: raw.image || mock?.image || '',
      banner: raw.banner || mock?.banner || raw.image || '',
      imagePosition: raw.imagePosition || mock?.imagePosition,
      bannerPosition: raw.bannerPosition || mock?.bannerPosition,
      cardImagePosition: raw.cardImagePosition || mock?.cardImagePosition,
      heroCardAlign: raw.heroCardAlign || mock?.heroCardAlign,
      bannerSize: raw.bannerSize || mock?.bannerSize,
      heroLayout: raw.heroLayout || mock?.heroLayout,
      heroCardCompact: raw.heroCardCompact ?? mock?.heroCardCompact,
      description: raw.description,
      availableTickets: raw.availableTickets,
      rating: raw.rating ?? mock?.rating ?? 4.5,
      ticketTiers: tiers,
      venueRef: raw.venueRef as EventItem['venueRef']
    };
  }

}
