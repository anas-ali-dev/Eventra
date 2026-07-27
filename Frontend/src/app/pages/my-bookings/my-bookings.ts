import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { BookingCard } from '../../components/booking-card/booking-card';
import { BookingService, StoredBooking } from '../../services/booking.service';

type TabFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    BookingCard
  ],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookingsComponent implements OnInit {

  activeTab: TabFilter = 'all';
  bookings: StoredBooking[] = [];
  loading = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.refreshBookings();
  }

  get filteredBookings(): StoredBooking[] {
    if (this.activeTab === 'all') {
      return this.bookings.filter(b => b.status !== 'cancelled');
    }
    return this.bookings.filter(b => b.status === this.activeTab);
  }

  setTab(tab: TabFilter): void {
    this.activeTab = tab;
  }

  async cancelBooking(bookingRef: string): Promise<void> {
    await this.bookingService.cancelBooking(bookingRef);
    this.bookings = this.bookingService.getAll();
  }

  removeBooking(bookingRef: string): void {
    this.bookingService.removeBooking(bookingRef);
    this.bookings = this.bookingService.getAll();
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private async refreshBookings(): Promise<void> {
    this.bookingService.hydrateFromCache();
    this.bookings = this.bookingService.getAll();
    this.loading = !this.bookings.length;

    try {
      await this.bookingService.loadBookings(true);
    } finally {
      this.bookings = this.bookingService.getAll();
      this.loading = false;
    }
  }

}
