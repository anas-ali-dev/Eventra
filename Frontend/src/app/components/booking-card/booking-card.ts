import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GroupedBookingTier } from '../../services/booking.service';

export type BookingStatus = 'upcoming' | 'past' | 'cancelled';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.css'
})
export class BookingCard {

  @Input() title = '';
  @Input() image = '';
  @Input() date = '';
  @Input() time = '';
  @Input() venue = '';
  @Input() price = 0;
  @Input() quantity = 1;
  @Input() total = 0;
  @Input() bookingRef = '';
  @Input() bookingRefs: string[] = [];
  @Input() bookingIds: string[] = [];
  @Input() tiers: GroupedBookingTier[] = [];
  @Input() ticketTierName = '';
  @Input() status: BookingStatus = 'upcoming';

  @Output() cancel = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  get displayTotal(): number {
    return this.total || this.price * this.quantity;
  }

  get refLabel(): string {
    if (this.bookingRefs.length > 1) {
      return `${this.bookingRefs.length} bookings combined`;
    }
    return `Ref: ${this.bookingRef || this.bookingRefs[0] || ''}`;
  }

  get canViewTicket(): boolean {
    return this.status !== 'cancelled' && !!this.viewTicketRef && this.bookingIds.length > 0;
  }

  get viewTicketRef(): string {
    return this.bookingRef || this.bookingRefs[0] || '';
  }

  get viewTicketRefs(): string[] {
    if (this.bookingRefs.length) {
      return this.bookingRefs;
    }
    return this.bookingRef ? [this.bookingRef] : [];
  }

  get viewTicketQueryParams(): { refs: string } | null {
    const refs = this.viewTicketRefs;
    if (!refs.length) {
      return null;
    }
    return { refs: refs.join(',') };
  }

  get tierLines(): GroupedBookingTier[] {
    if (this.tiers.length) {
      return this.tiers;
    }
    if (this.ticketTierName) {
      return [{
        ticketTierName: this.ticketTierName,
        quantity: this.quantity,
        total: this.displayTotal,
        bookingRef: this.bookingRef || this.bookingRefs[0] || ''
      }];
    }
    return [];
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onRemove(): void {
    this.remove.emit();
  }
}
