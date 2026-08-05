import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';
import { EventItem } from '../../models/event.model';
import { TicketTier } from '../../shared/models/venue.model';

const SERVICE_FEE_PER_TICKET = 25;
const VALID_PROMO_CODES: Record<string, number> = {
  'EVENTRA10': 0.10,
  'WELCOME15': 0.15
};

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class BookingComponent implements OnInit {

  event: EventItem | undefined;
  ticketTiers: TicketTier[] = [];
  selectedTier: TicketTier | undefined;

  quantity = 1;
  promoCode = '';
  appliedPromo: string | null = null;
  promoError = '';
  bookingError = '';
  confirmed = false;
  bookingRef = '';
  loading = false;
  pageLoading = true;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('eventId');
    const id = Number(idParam);

    if (!id) {
      this.pageLoading = false;
      return;
    }

    this.event = this.eventService.getById(id);
    if (this.event) {
      this.setupTiers();
      this.pageLoading = false;
      this.cdr.detectChanges();
    }

    void this.eventService.refreshEvent(id).then(loaded => {
      this.event = loaded ?? this.eventService.getById(id);
      this.setupTiers();
      this.pageLoading = false;
      this.cdr.detectChanges();
    });
  }

  get maxQuantity(): number {
    const avail = this.selectedTier?.availableTickets ?? this.event?.availableTickets ?? 1;
    return Math.min(avail, 10);
  }

  get subtotal(): number {
    const price = this.selectedTier?.price ?? this.event?.price ?? 0;
    return price * this.quantity;
  }

  get serviceFee(): number {
    return SERVICE_FEE_PER_TICKET * this.quantity;
  }

  get discountRate(): number {
    return this.appliedPromo ? VALID_PROMO_CODES[this.appliedPromo] : 0;
  }

  get discountAmount(): number {
    return Math.round(this.subtotal * this.discountRate);
  }

  get total(): number {
    return this.subtotal + this.serviceFee - this.discountAmount;
  }

  selectTier(tier: TicketTier): void {
    this.selectedTier = tier;
    if (this.quantity > this.maxQuantity) {
      this.quantity = this.maxQuantity;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  applyPromoCode(): void {
    const code = this.promoCode.trim().toUpperCase();

    if (!code) {
      this.promoError = 'Please enter a promo code.';
      return;
    }

    if (VALID_PROMO_CODES[code]) {
      this.appliedPromo = code;
      this.promoError = '';
    } else {
      this.appliedPromo = null;
      this.promoError = 'Invalid promo code.';
    }
  }

  removePromo(): void {
    this.appliedPromo = null;
    this.promoCode = '';
    this.promoError = '';
  }

  async confirmBooking(): Promise<void> {
    if (!this.event || this.loading) return;

    this.loading = true;
    this.bookingError = '';

    try {
      const booking = await this.bookingService.addBooking({
        event: this.event,
        quantity: this.quantity,
        total: this.total,
        bookingRef: this.bookingService.generateRef(),
        ticketTier: this.selectedTier,
        promoCode: this.appliedPromo || undefined
      });

      this.bookingRef = booking.bookingRef;
      this.confirmed = true;

      void this.eventService.refreshEvent(this.event.id).then(refreshed => {
        if (refreshed) {
          this.event = refreshed;
          this.setupTiers();
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      this.bookingError = err instanceof Error
        ? err.message
        : 'Booking failed. Please try again.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private setupTiers(): void {
    if (!this.event) return;

    if (this.event.ticketTiers?.length) {
      this.ticketTiers = this.event.ticketTiers;
    } else {
      this.ticketTiers = [
        {
          name: 'General Admission',
          slug: 'general',
          description: 'Standard entry',
          price: this.event.price,
          availableTickets: this.event.availableTickets,
          perks: ['General entry']
        },
        {
          name: 'Stage View',
          slug: 'stage-view',
          description: 'Closer to the action',
          price: Math.round(this.event.price * 1.45),
          availableTickets: Math.max(1, Math.floor(this.event.availableTickets * 0.3)),
          perks: ['Premium zone', 'Closer to stage']
        },
        {
          name: 'VIP Lounge',
          slug: 'vip',
          description: 'Full premium experience',
          price: Math.round(this.event.price * 2.25),
          availableTickets: Math.max(1, Math.floor(this.event.availableTickets * 0.15)),
          perks: ['VIP seating', 'Lounge access', 'Priority entry']
        }
      ];
    }

    const currentSlug = this.selectedTier?.slug;
    this.selectedTier = currentSlug
      ? this.ticketTiers.find(t => t.slug === currentSlug) ?? this.ticketTiers[0]
      : this.ticketTiers[0];

    if (this.quantity > this.maxQuantity) {
      this.quantity = Math.max(1, this.maxQuantity);
    }
  }

}
