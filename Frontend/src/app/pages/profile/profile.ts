import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventCardComponent } from '../../components/event-card/event-card';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { EventItem } from '../../models/event.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    EventCardComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  profile: User | null = null;
  editedProfile: Partial<User> = {};
  isEditing = false;
  bookingsCount = 0;
  savedEvents: EventItem[] = [];
  loading = true;
  saveMessage = '';

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private auth: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    const name = this.profile?.name || '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  startEditing(): void {
    if (!this.profile) return;
    this.editedProfile = { ...this.profile };
    this.isEditing = true;
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.userService.updateProfile({
      name: this.editedProfile.name,
      phone: this.editedProfile.phone,
      city: this.editedProfile.city,
      favouriteCategory: this.editedProfile.favouriteCategory
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
          this.isEditing = false;
          this.saveMessage = 'Profile updated!';
        }
      }
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.userService.updateProfile({ profilePicture: dataUrl }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.profile = res.data;
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }

  unsaveEvent(event: EventItem): void {
    this.userService.unsaveEvent(event.mongoId || event.id).subscribe({
      next: () => this.loadSavedEvents()
    });
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }

  private loadProfile(): void {
    const cached = this.auth.currentUser();

    if (cached) {
      this.profile = cached;
      this.loading = false;
    } else {
      this.loading = true;
    }

    this.userService.getProfile().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
          this.bookingsCount = res.data.bookingsCount ?? 0;
        } else if (!this.profile) {
          this.profile = this.auth.currentUser();
        }

        this.refreshStats();
      },
      error: () => {
        if (!this.profile) {
          this.profile = this.auth.currentUser();
        }
      }
    });
  }

  private refreshStats(): void {
    this.bookingService.hydrateFromCache();
    this.bookingsCount = this.bookingService.getBookingsCount();

    this.bookingService.loadBookings(true).then(() => {
      this.bookingsCount = this.bookingService.getBookingsCount();
    });

    this.loadSavedEvents();
  }

  private loadSavedEvents(): void {
    this.userService.getSavedEvents().subscribe({
      next: (res) => {
        if (res.success && res.data?.length) {
          this.savedEvents = (res.data as Record<string, unknown>[]).map(raw =>
            this.eventService.getById(Number(raw['legacyId'])) ||
            this.mapRawEvent(raw)
          ).filter((e): e is EventItem => !!e);
        } else {
          this.savedEvents = [];
        }
      },
      error: () => {
        this.savedEvents = [];
      }
    });
  }

  private mapRawEvent(raw: Record<string, unknown>): EventItem | undefined {
    const legacyId = Number(raw['legacyId']);
    if (!legacyId) return undefined;

    return {
      id: legacyId,
      mongoId: String(raw['_id'] || ''),
      title: String(raw['title'] || ''),
      category: String(raw['categoryName'] || 'Concert'),
      date: String(raw['date'] || '').split('T')[0],
      time: String(raw['time'] || ''),
      venue: String(raw['venue'] || ''),
      city: String(raw['city'] || ''),
      price: Number(raw['price'] || 0),
      image: String(raw['image'] || ''),
      banner: String(raw['banner'] || raw['image'] || ''),
      description: String(raw['description'] || ''),
      availableTickets: Number(raw['availableTickets'] || 0),
      rating: Number(raw['rating'] || 4.5)
    };
  }

}
