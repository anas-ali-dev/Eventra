import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';



import { NavbarComponent } from '../../components/navbar/navbar';

import { FooterComponent } from '../../components/footer/footer';

import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';

import { BookingCard } from '../../components/booking-card/booking-card';

import { BookingService, GroupedBooking } from '../../services/booking.service';



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

  bookings: GroupedBooking[] = [];

  loading = false;



  constructor(

    private bookingService: BookingService,

    private cdr: ChangeDetectorRef

  ) {}



  ngOnInit(): void {

    void this.refreshBookings();

  }



  setTab(tab: TabFilter): void {

    this.activeTab = tab;

    this.bookings = this.buildBookings();

    this.cdr.detectChanges();

  }



  async cancelBooking(booking: GroupedBooking): Promise<void> {

    await this.bookingService.cancelGroupedBooking(booking.bookingRefs);

    this.bookings = this.buildBookings();

    this.cdr.detectChanges();

  }



  removeBooking(bookingRef: string): void {

    this.bookingService.removeBooking(bookingRef);

    this.bookings = this.buildBookings();

    this.cdr.detectChanges();

  }



  formatDate(isoDate: string): string {

    const date = new Date(isoDate + 'T00:00:00');

    return date.toLocaleDateString('en-GB', {

      day: 'numeric',

      month: 'long',

      year: 'numeric'

    });

  }



  private buildBookings(): GroupedBooking[] {

    const raw = this.activeTab === 'all'

      ? this.bookingService.getAll().filter(b => b.status !== 'cancelled')

      : this.bookingService.getByStatus(this.activeTab);



    return this.bookingService.getGrouped(raw);

  }



  private async refreshBookings(): Promise<void> {

    this.bookingService.hydrateFromCache();

    this.bookings = this.buildBookings();

    this.loading = !this.bookings.length;

    this.cdr.detectChanges();



    try {

      await this.bookingService.loadBookings(true);

    } finally {

      this.bookings = this.buildBookings();

      this.loading = false;

      this.cdr.detectChanges();

    }

  }



}


