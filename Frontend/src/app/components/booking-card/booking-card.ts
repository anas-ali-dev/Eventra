import { Component, EventEmitter, Input, Output } from '@angular/core';

export type BookingStatus = 'upcoming' | 'past' | 'cancelled';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [],
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
  @Input() bookingRef = '';
  @Input() status: BookingStatus = 'upcoming';

  @Output() cancel = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onRemove(): void {
    this.remove.emit();
  }
}
